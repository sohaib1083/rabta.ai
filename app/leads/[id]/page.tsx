'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Lead, LeadRole, LeadStatus, LeadResult } from '@/types/Lead';

interface ApiResponse {
  success: boolean;
  data: Lead;
  error?: string;
}

interface CallResponse {
  success: boolean;
  data: Lead;
  message?: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params?.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calling, setCalling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [updating, setUpdating] = useState(false);

  // Fetch lead details
  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leads/${leadId}`);
        const data: ApiResponse = await response.json();

        if (data.success) {
          setLead(data.data);
        } else {
          setError(data.error || 'Lead not found');
        }
      } catch (err) {
        setError('Failed to fetch lead details');
        console.error('Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  // Handle calling the lead
  const handleCall = async () => {
    setCalling(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/call`, {
        method: 'POST',
      });

      const data: CallResponse = await response.json();

      if (data.success) {
        setLead(data.data);
        alert(data.message || 'Call completed successfully! Check the updated information below.');
      } else {
        alert('Failed to initiate call');
      }
    } catch (err) {
      console.error('Error calling lead:', err);
      alert('Failed to initiate call');
    } finally {
      setCalling(false);
    }
  };

  // Handle updating lead information
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setLead(data.data);
        setEditing(false);
        setEditForm({});
        alert('Lead updated successfully!');
      } else {
        alert('Failed to update lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead');
    } finally {
      setUpdating(false);
    }
  };

  // Handle edit mode
  const startEditing = () => {
    setEditForm({
      name: lead?.name || '',
      phone: lead?.phone || '',
      role: lead?.role || undefined,
      area: lead?.area || '',
      budget: lead?.budget || '',
      status: lead?.status || 'pending',
      result: lead?.result || undefined,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm({});
  };

  // Handle marking lead as answered (dev simulation)
  const handleMarkAnswered = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'answered' }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setLead(data.data);
        alert('Lead marked as answered!');
      } else {
        alert('Failed to update lead status');
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      alert('Failed to update lead status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/leads"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/leads"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ← Back to Leads
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lead.name || 'Unknown Contact'}
              </h1>
              <p className="text-gray-600">{lead.phone}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {editing ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={cancelEditing}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEditing}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Edit Lead
                </button>
                {(lead.status === 'pending' || lead.status === 'calling') && (
                  <button
                    onClick={handleMarkAnswered}
                    disabled={updating}
                    className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 font-semibold disabled:opacity-50"
                  >
                    🔧 Mark Answered
                  </button>
                )}
                <button
                  onClick={handleCall}
                  disabled={calling || lead.status === 'qualified'}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {calling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Calling...
                    </>
                  ) : (
                    'Call Now'
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lead Information</h2>
            
            <div className="space-y-6">
              {editing ? (
                /* Edit Form */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Name</h3>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Phone</h3>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Role</h3>
                      <select
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({...editForm, role: (e.target.value || undefined) as LeadRole | undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Not classified</option>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="renter">Renter</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Status</h3>
                      <select
                        value={editForm.status || 'pending'}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value as LeadStatus})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="calling">Calling</option>
                        <option value="answered">Answered</option>
                        <option value="qualified">Qualified</option>
                        <option value="dropped">Dropped</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Area</h3>
                      <input
                        type="text"
                        value={editForm.area || ''}
                        onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter area"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Result</h3>
                      <select
                        value={editForm.result || ''}
                        onChange={(e) => setEditForm({...editForm, result: (e.target.value || undefined) as LeadResult | undefined})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Not set</option>
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Budget</h3>
                    <input
                      type="text"
                      value={editForm.budget || ''}
                      onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter budget"
                    />
                  </div>
                </>
              ) : (
                /* Display View */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Phone</h3>
                      <p className="text-lg font-medium text-gray-900">{lead.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Source</h3>
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${
                        lead.source === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.source?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Area</h3>
                      <p className="text-lg font-medium text-gray-900">{lead.area || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Budget</h3>
                      <p className="text-lg font-medium text-gray-900">{lead.budget || 'Not specified'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Call Status & Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Call Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-full ${
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.status === 'calling' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'answered' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.status.toUpperCase()}
                  </span>
                </div>

                {lead.role && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Classified as</span>
                    <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-full ${
                      lead.role === 'buyer' ? 'bg-green-100 text-green-800' :
                      lead.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {lead.role.toUpperCase()}
                    </span>
                  </div>
                )}

                {lead.result && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lead Temperature</span>
                    <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-full ${
                      lead.result === 'hot' ? 'bg-red-100 text-red-800' :
                      lead.result === 'warm' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.result.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Call Attempts</span>
                  <span className="text-lg font-bold text-gray-900">{lead.callAttempts}</span>
                </div>

                {lead.lastCallAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Call</span>
                    <span className="text-sm text-gray-900">
                      {new Date(lead.lastCallAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(lead.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(lead.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  disabled={calling}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {calling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Call...
                    </>
                  ) : (
                    'Initiate AI Call'
                  )}
                </button>
                
                <Link
                  href="/leads"
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 font-semibold text-center block"
                >
                  Back to All Leads
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}