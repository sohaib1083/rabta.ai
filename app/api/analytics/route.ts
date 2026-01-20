import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongodb';
import { LeadModel } from '@/models/Lead';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
}

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Calculate date filter based on range
    interface DateFilter {
      createdAt?: {
        $gte: Date;
      };
    }
    let dateFilter: DateFilter = {};
    const now = new Date();
    
    switch (range) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case 'all':
        dateFilter = {};
        break;
    }

    // Get basic stats
    const [
      totalCount,
      statusStats,
      roleStats,
      sourceStats,
      areaStats,
      resultStats
    ] = await Promise.all([
      // Total count
      LeadModel.countDocuments(dateFilter),
      
      // Status distribution
      LeadModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Role distribution
      LeadModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      // Source distribution
      LeadModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      
      // Top areas
      LeadModel.aggregate([
        { $match: { ...dateFilter, area: { $ne: null, $ne: '' } } },
        { $group: { _id: '$area', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Result distribution
      LeadModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$result', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate call statistics
    const callStats = await LeadModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: '$callAttempts' },
          totalLeads: { $sum: 1 }
        }
      }
    ]);

    // Process status stats
    const statusMap = statusStats.reduce((acc: any, item: any) => {
      acc[item._id || 'pending'] = item.count;
      return acc;
    }, {});

    const pending = statusMap.pending || 0;
    const calling = statusMap.calling || 0;
    const answered = statusMap.answered || 0;
    const qualified = statusMap.qualified || 0;
    const dropped = statusMap.dropped || 0;

    // Process role stats
    const roleMap = roleStats.reduce((acc: any, item: any) => {
      if (item._id) {
        acc[item._id] = item.count;
      } else {
        acc.unclassified = (acc.unclassified || 0) + item.count;
      }
      return acc;
    }, { buyer: 0, seller: 0, renter: 0, unclassified: 0 });

    // Process source stats
    const sourceMap = sourceStats.reduce((acc: any, item: any) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {});

    // Process result stats
    const resultMap = resultStats.reduce((acc: any, item: any) => {
      if (item._id) {
        acc[item._id] = item.count;
      }
      return acc;
    }, {});

    // Calculate metrics
    const avgCallsPerLead = callStats.length > 0 && callStats[0].totalLeads > 0 
      ? Math.round((callStats[0].totalCalls / callStats[0].totalLeads) * 10) / 10 
      : 0;

    const conversionRate = totalCount > 0 
      ? Math.round((qualified / totalCount) * 1000) / 10 
      : 0;

    const analyticsData = {
      // Basic stats
      total: totalCount,
      pending,
      calling,
      answered,
      qualified,
      dropped,
      hotLeads: resultMap.hot || 0,
      warmLeads: resultMap.warm || 0,
      coldLeads: resultMap.cold || 0,
      
      // Calculated metrics
      totalRevenue: qualified * 50000, // Dummy revenue calculation
      avgCallsPerLead,
      conversionRate,
      
      // Breakdown data
      leadsBySource: {
        new: sourceMap.new || 0,
        old: sourceMap.old || 0
      },
      
      leadsByRole: {
        buyer: roleMap.buyer || 0,
        seller: roleMap.seller || 0,
        renter: roleMap.renter || 0,
        unclassified: roleMap.unclassified || 0
      },
      
      // Dummy time series data for calls per day
      callsPerDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        calls: Math.floor(Math.random() * 10) + 5
      })),
      
      topPerformingAreas: areaStats.map((area: any) => ({
        area: area._id,
        count: area.count
      }))
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}