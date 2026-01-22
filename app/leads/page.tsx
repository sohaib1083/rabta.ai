'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Lead, LeadStats, getValidTransitions, canTransitionTo, LeadStatus } from '@/types/Lead';

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

export default function LeadsPage() {
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
  const [filter, setFilter] = useState('all');
  const [callingLeads, setCallingLeads] = useState<Set<string>>(new Set());
  const [updatingLeads, setUpdatingLeads] = useState<Set<string>>(new Set());

  // Fetch leads from API
  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
        const response = await fetch(url);
        const data: ApiResponse = await response.json();

        if (data.success) {
          setLeads(data.data);
          setStats(data.stats);
        } else {
          throw new Error('Failed to fetch leads');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [filter]);

  // Handle calling a lead
  const handleCall = async (leadId: string) => {
    setCallingLeads(prev => new Set(prev).add(leadId));
    
    try {
      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the lead in the state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead._id === leadId ? result.data : lead
          )
        );
        // Refetch to update stats
        const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
        const refreshResponse = await fetch(url);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setStats(refreshData.stats);
        }
        alert(result.message || 'Call initiated successfully!');
      } else {
        alert(`Failed to initiate call: ${result.error}`);
      }
    } catch (err) {
      console.error('Error calling lead:', err);
      alert('Failed to initiate call: Network error');
    } finally {
      setCallingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  // Handle manual dialing (using your personal phone)
  const handleManualCall = async (leadId: string) => {
    setCallingLeads(prev => new Set(prev).add(leadId));
    
    try {
      const response = await fetch('/api/calls/manual-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const result = await response.json();

      if (result.success) {
        const { manualDialing } = result;
        
        // Show instructions for manual dialing
        const shouldProceed = confirm(
          `📞 MANUAL DIAL INSTRUCTIONS:\n\n` +
          `1. Call this number from your phone (+923330220803):\n` +
          `   ${manualDialing.phoneNumber}\n\n` +
          `2. Say this script:\n` +
          `   "${manualDialing.script}"\n\n` +
          `3. After the call, click "Mark Answered" or "No Answer"\n\n` +
          `Click OK to proceed, Cancel to abort.`
        );

        if (shouldProceed) {
          // Update the lead in the state
          setLeads(prevLeads => 
            prevLeads.map(lead => 
              lead._id === leadId ? result.data : lead
            )
          );
          
          // Refetch to update stats
          const url = filter === 'all' ? '/api/leads' : `/api/calls?status=${filter}`;
          const refreshResponse = await fetch(url);
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            setStats(refreshData.stats);
          }
          
          // Copy number to clipboard for easy dialing
          navigator.clipboard.writeText(manualDialing.phoneNumber).catch(() => {});
          
          alert(`✅ Ready! Number copied: ${manualDialing.phoneNumber}\n\nNow dial from your phone and use the result buttons after the call.`);
        }
      } else {
        alert(`Failed to prepare manual call: ${result.error}`);
      }
    } catch (err) {
      console.error('Error preparing manual call:', err);
      alert('Failed to prepare manual call: Network error');
    } finally {
      setCallingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  // Handle manual field updates
  const handleFieldUpdate = async (leadId: string, field: string, value: string | null) => {
    setUpdatingLeads(prev => new Set(prev).add(leadId));
    
    // Pre-validate state transitions
    if (field === 'status' && value) {
      const currentLead = leads.find(lead => lead._id === leadId);
      if (currentLead && !canTransitionTo(currentLead.status as LeadStatus, value as LeadStatus)) {
        const validTransitions = getValidTransitions(currentLead.status as LeadStatus);
        alert(`Invalid status transition from "${currentLead.status}" to "${value}". Valid options: ${validTransitions.join(', ')}`);
        setUpdatingLeads(prev => {
          const newSet = new Set(prev);
          newSet.delete(leadId);
          return newSet;
        });
        return;
      }
    }
    
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the lead in the state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead._id === leadId ? result.data : lead
          )
        );
        // Refetch to update stats
        const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
        const refreshResponse = await fetch(url);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setStats(refreshData.stats);
        }
      } else {
        alert(`Failed to update ${field}: ${result.error}`);
      }
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      alert(`Failed to update ${field}: Network error`);
    } finally {
      setUpdatingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  // Handle marking lead as answered (dev simulation)
  const handleMarkAnswered = async (leadId: string) => {
    setUpdatingLeads(prev => new Set(prev).add(leadId));
    
    try {
      const response = await fetch('/api/calls/answered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the lead in the state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead._id === leadId ? result.data : lead
          )
        );
        // Refetch to update stats
        const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
        const refreshResponse = await fetch(url);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setStats(refreshData.stats);
        }
        alert(result.message || 'Call marked as answered');
      } else {
        alert(`Failed to mark as answered: ${result.error}`);
      }
    } catch (err) {
      console.error('Error marking as answered:', err);
      alert('Failed to mark as answered: Network error');
    } finally {
      setUpdatingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  // Handle marking call as no answer (dev simulation)
  const handleNoAnswer = async (leadId: string) => {
    setUpdatingLeads(prev => new Set(prev).add(leadId));
    
    try {
      const response = await fetch('/api/calls/no-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the lead in the state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead._id === leadId ? result.data : lead
          )
        );
        // Refetch to update stats
        const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
        const refreshResponse = await fetch(url);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setStats(refreshData.stats);
        }
        alert(result.message || 'Call marked as no answer');
      } else {
        alert(`Failed to mark no answer: ${result.error}`);
      }
    } catch (err) {
      console.error('Error marking no answer:', err);
      alert('Failed to mark no answer: Network error');
    } finally {
      setUpdatingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading leads</div>
          <p className="text-gray-600">{error}</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your lead calling activities
            </p>
          </div>
          <Link
            href="/leads/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
          >
            Add New Lead
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Leads</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Hot Prospects</h3>
            <p className="text-3xl font-bold text-red-600">{stats.hotLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Qualified</h3>
            <p className="text-3xl font-bold text-green-600">{stats.qualified}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Active</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.calling + stats.answered}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Leads', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'calling', label: 'Calling', count: stats.calling },
                { key: 'answered', label: 'Answered', count: stats.answered },
                { key: 'qualified', label: 'Qualified', count: stats.qualified },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            {leads.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calls
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {lead.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {lead.name || 'Unknown Contact'}
                            </div>
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.role || ''}
                          onChange={(e) => handleFieldUpdate(lead._id!, 'role', e.target.value || null)}
                          disabled={updatingLeads.has(lead._id!)}
                          className="text-xs font-bold rounded-full border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: lead.role === 'buyer' ? '#dcfce7' : 
                                           lead.role === 'seller' ? '#dbeafe' :
                                           lead.role === 'renter' ? '#f3e8ff' : '#f3f4f6',
                            color: lead.role === 'buyer' ? '#166534' :
                                   lead.role === 'seller' ? '#1e40af' :
                                   lead.role === 'renter' ? '#7c3aed' : '#6b7280'
                          }}
                        >
                          <option value="">Not classified</option>
                          <option value="buyer">BUYER</option>
                          <option value="seller">SELLER</option>
                          <option value="renter">RENTER</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.area || '-'}</div>
                        {lead.budget && (
                          <div className="text-xs text-gray-500">{lead.budget}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => handleFieldUpdate(lead._id!, 'status', e.target.value)}
                          disabled={updatingLeads.has(lead._id!)}
                          className="text-xs font-bold rounded-full border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: lead.status === 'qualified' ? '#dcfce7' :
                                           lead.status === 'calling' ? '#dbeafe' :
                                           lead.status === 'answered' ? '#fef3c7' :
                                           lead.status === 'pending' ? '#f3f4f6' : '#fecaca',
                            color: lead.status === 'qualified' ? '#166534' :
                                   lead.status === 'calling' ? '#1e40af' :
                                   lead.status === 'answered' ? '#d97706' :
                                   lead.status === 'pending' ? '#6b7280' : '#dc2626'
                          }}
                        >
                          {/* Current status is always shown */}
                          <option value={lead.status}>
                            {lead.status.toUpperCase()}
                          </option>
                          {/* Show valid transitions only */}
                          {getValidTransitions(lead.status as LeadStatus).map(status => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.result || ''}
                          onChange={(e) => handleFieldUpdate(lead._id!, 'result', e.target.value || null)}
                          disabled={updatingLeads.has(lead._id!)}
                          className="text-xs font-bold rounded-full border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: lead.result === 'hot' ? '#fecaca' :
                                           lead.result === 'warm' ? '#fed7aa' :
                                           lead.result === 'cold' ? '#dbeafe' : '#f3f4f6',
                            color: lead.result === 'hot' ? '#dc2626' :
                                   lead.result === 'warm' ? '#ea580c' :
                                   lead.result === 'cold' ? '#1e40af' : '#6b7280'
                          }}
                        >
                          <option value="">-</option>
                          <option value="hot">HOT</option>
                          <option value="warm">WARM</option>
                          <option value="cold">COLD</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.callAttempts}
                        </div>
                        {lead.lastCallAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(lead.lastCallAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCall(lead._id!)}
                              disabled={callingLeads.has(lead._id!) || updatingLeads.has(lead._id!) || lead.status === 'qualified'}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {callingLeads.has(lead._id!) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Calling...
                                </>
                              ) : (
                                'Call Now'
                              )}
                            </button>
                            <Link
                              href={`/leads/${lead._id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold inline-block"
                            >
                              View
                            </Link>
                          </div>
                          {/* DEV BUTTONS: Mark as Answered & No Answer */}
                          {(lead.status === 'pending' || lead.status === 'calling') && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleMarkAnswered(lead._id!)}
                                disabled={updatingLeads.has(lead._id!)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                              >
                                🔧 Mark Answered
                              </button>
                              {lead.status === 'calling' && (
                                <button
                                  onClick={() => handleNoAnswer(lead._id!)}
                                  disabled={updatingLeads.has(lead._id!)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                                >
                                  📞 No Answer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No leads found</div>
                <p className="text-gray-500">Add your first lead to get started</p>
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
      </div>
    </div>
  );
}