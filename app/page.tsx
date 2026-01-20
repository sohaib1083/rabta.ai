'use client';

import Link from 'next/link';
import { Lead, LeadStats } from '@/types/Lead';
import { useState, useEffect } from 'react';

interface ApiResponse {
  success: boolean;
  data: Lead[];
  stats: LeadStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    pending: 0,
    calling: 0,
    answered: 0,
    qualified: 0,
    dropped: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads and stats from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/leads?limit=10');
        const data: ApiResponse = await response.json();

        if (data.success) {
          setLeads(data.data);
          setStats(data.stats);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading dashboard</div>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-lg text-slate-600 mt-2 font-medium">
              Real-time insights for Pakistani real estate market
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/leads/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/25"
            >
              Add New Lead
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                +12.5%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Total Leads</h3>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.total.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14l-1.121 2.121z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                +34.7%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Hot Prospects</h3>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.hotLeads.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 003.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                +8.2%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Qualified</h3>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.qualified.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.503 11.945a11.052 11.052 0 006.105 6.105l2.558-3.721a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                +16.3%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Active Campaigns</h3>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{(stats.calling + stats.answered).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Recent Lead Activity</h3>
                <p className="text-slate-600 font-medium">Latest engagements and updates</p>
              </div>
              <Link href="/leads" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                View All Leads →
              </Link>
            </div>
            
            <div className="space-y-4">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {lead.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{lead.name || 'Unknown Contact'}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-slate-600 font-medium">{lead.phone}</p>
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          <p className="text-sm text-slate-500">{lead.area}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                        lead.status === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                        lead.status === 'calling' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {lead.status.toUpperCase()}
                      </div>
                      {lead.result && (
                        <div className={`inline-flex px-3 py-1 text-xs font-bold rounded-full mt-1 ${
                          lead.result === 'hot' ? 'bg-red-100 text-red-800' :
                          lead.result === 'warm' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.result.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-2">No leads found</div>
                  <p className="text-slate-500">Add your first lead to get started</p>
                  <Link
                    href="/leads/new"
                    className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Lead
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/leads/new"
                  className="flex items-center space-x-3 p-4 bg-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <h4 className="font-bold">Add New Lead</h4>
                    <p className="text-blue-100 text-sm">Import contacts</p>
                  </div>
                </Link>

                <Link
                  href="/leads"
                  className="flex items-center space-x-3 p-4 bg-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div>
                    <h4 className="font-bold">View Pipeline</h4>
                    <p className="text-emerald-100 text-sm">Manage leads</p>
                  </div>
                </Link>

                <button
                  onClick={() => console.log('Starting bulk calls...')}
                  className="w-full flex items-center space-x-3 p-4 bg-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.503 11.945a11.052 11.052 0 006.105 6.105l2.558-3.721a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h4 className="font-bold">Start Campaign</h4>
                    <p className="text-amber-100 text-sm">Begin auto-dialing</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Call System</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-600 font-bold text-sm">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">AI Classification</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-600 font-bold text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-600 font-bold text-sm">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}