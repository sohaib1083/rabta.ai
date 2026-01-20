'use client';

import { useState, useEffect } from 'react';

interface Settings {
  companyName: string;
  phoneNumber: string;
  email: string;
  address: string;
  defaultSource: 'new' | 'old';
  autoCallEnabled: boolean;
  callRetryAttempts: number;
  callTimeout: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  timezone: string;
  currency: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: 'LeadCall AI',
    phoneNumber: '+92-321-0000000',
    email: 'admin@leadcall.ai',
    address: 'Karachi, Pakistan',
    defaultSource: 'new',
    autoCallEnabled: true,
    callRetryAttempts: 3,
    callTimeout: 30,
    emailNotifications: true,
    smsNotifications: false,
    timezone: 'Asia/Karachi',
    currency: 'PKR',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('leadcall_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('leadcall_settings', JSON.stringify(settings));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        companyName: 'LeadCall AI',
        phoneNumber: '+92-321-0000000',
        email: 'admin@leadcall.ai',
        address: 'Karachi, Pakistan',
        defaultSource: 'new',
        autoCallEnabled: true,
        callRetryAttempts: 3,
        callTimeout: 30,
        emailNotifications: true,
        smsNotifications: false,
        timezone: 'Asia/Karachi',
        currency: 'PKR',
      });
      setMessage({ type: 'success', text: 'Settings reset to default values!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢' },
    { id: 'calling', label: 'Calling', icon: '📞' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your LeadCall AI system preferences</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Settings Categories</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={settings.phoneNumber}
                          onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Default Lead Source
                        </label>
                        <select
                          value={settings.defaultSource}
                          onChange={(e) => setSettings({ ...settings, defaultSource: e.target.value as 'new' | 'old' })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="new">New Leads</option>
                          <option value="old">Existing Leads</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Office Address
                      </label>
                      <textarea
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Calling Settings */}
              {activeTab === 'calling' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Calling Configuration</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Auto Calling</h3>
                        <p className="text-sm text-gray-600">Automatically initiate calls for new leads</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoCallEnabled}
                          onChange={(e) => setSettings({ ...settings, autoCallEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Max Retry Attempts
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={settings.callRetryAttempts}
                          onChange={(e) => setSettings({ ...settings, callRetryAttempts: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum number of call attempts per lead</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Call Timeout (seconds)
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="120"
                          value={settings.callTimeout}
                          onChange={(e) => setSettings({ ...settings, callTimeout: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">How long to wait before considering a call failed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates about lead status changes via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Receive urgent alerts via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.smsNotifications}
                          onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.currency}
                          onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="PKR">Pakistani Rupee (PKR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                          <option value="AED">UAE Dirham (AED)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-red-800 font-semibold mb-2">Reset All Data</h4>
                        <p className="text-red-600 text-sm mb-4">
                          This will permanently delete all leads, call records, and analytics data. This action cannot be undone.
                        </p>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold">
                          Reset All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}