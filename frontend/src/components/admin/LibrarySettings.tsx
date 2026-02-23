import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface LibrarySettings {
  _id?: string;
  morningSlot: {
    startTime: string;
    endTime: string;
  };
  eveningSlot: {
    startTime: string;
    endTime: string;
  };
  lastUpdatedBy?: {
    name: string;
    email: string;
  };
  updatedAt?: string;
}

const LibrarySettings: React.FC = () => {
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [morningStart, setMorningStart] = useState('06:00');
  const [morningEnd, setMorningEnd] = useState('12:00');
  const [eveningStart, setEveningStart] = useState('14:00');
  const [eveningEnd, setEveningEnd] = useState('20:00');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/settings/library', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data.settings;
      setSettings(data);
      setMorningStart(data.morningSlot.startTime);
      setMorningEnd(data.morningSlot.endTime);
      setEveningStart(data.eveningSlot.startTime);
      setEveningEnd(data.eveningSlot.endTime);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load library settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate times
    const morningStartInt = parseInt(morningStart.replace(':', ''));
    const morningEndInt = parseInt(morningEnd.replace(':', ''));
    const eveningStartInt = parseInt(eveningStart.replace(':', ''));
    const eveningEndInt = parseInt(eveningEnd.replace(':', ''));

    if (morningStartInt >= morningEndInt) {
      toast.error('Morning start time must be before end time');
      return;
    }

    if (eveningStartInt >= eveningEndInt) {
      toast.error('Evening start time must be before end time');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:5000/api/settings/library',
        {
          morningSlot: {
            startTime: morningStart,
            endTime: morningEnd,
          },
          eveningSlot: {
            startTime: eveningStart,
            endTime: eveningEnd,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Library settings updated successfully!');
      fetchSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save settings';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-black text-white flex items-center gap-3">
          <span className="text-5xl">⏰</span>
          Library Time Settings
        </h1>
        <p className="text-blue-100 mt-2 text-lg">Configure morning and evening operating hours</p>
      </div>

      {/* Current Settings Info */}
      {settings && (
        <Card className="border-l-4 border-blue-500 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Last Updated</p>
              <p className="text-lg font-bold text-blue-900">
                {new Date(settings.updatedAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Updated By</p>
              <p className="text-lg font-bold text-blue-900">
                {settings.lastUpdatedBy?.name || 'Admin'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Email</p>
              <p className="text-lg font-bold text-blue-900">
                {settings.lastUpdatedBy?.email || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Settings Form */}
      <Card className="border-l-4 border-purple-500">
        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
          <span className="text-3xl">⚙️</span> Configure Time Slots
        </h2>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Morning Slot */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
            <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">🌅</span> Morning Slot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-amber-900 mb-3">
                  Start Time (Opening)
                </label>
                <input
                  type="time"
                  value={morningStart}
                  onChange={(e) => setMorningStart(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-semibold text-lg"
                />
                <p className="text-xs text-amber-700 mt-2">Library opening time</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-900 mb-3">
                  End Time (Closing)
                </label>
                <input
                  type="time"
                  value={morningEnd}
                  onChange={(e) => setMorningEnd(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-semibold text-lg"
                />
                <p className="text-xs text-amber-700 mt-2">Morning session ends</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-300">
              <p className="text-sm text-amber-800 font-semibold">
                📅 Morning Hours: <span className="font-black">{morningStart}</span> to <span className="font-black">{morningEnd}</span>
              </p>
            </div>
          </div>

          {/* Evening Slot */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
            <h3 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">🌆</span> Evening Slot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  Start Time (Opening)
                </label>
                <input
                  type="time"
                  value={eveningStart}
                  onChange={(e) => setEveningStart(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg"
                />
                <p className="text-xs text-blue-700 mt-2">Evening session starts</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  End Time (Closing)
                </label>
                <input
                  type="time"
                  value={eveningEnd}
                  onChange={(e) => setEveningEnd(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg"
                />
                <p className="text-xs text-blue-700 mt-2">Library closing time</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-sm text-blue-800 font-semibold">
                📅 Evening Hours: <span className="font-black">{eveningStart}</span> to <span className="font-black">{eveningEnd}</span>
              </p>
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <h3 className="text-lg font-black text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Daily Schedule Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-300">
                <span className="font-semibold text-gray-700">🌅 Morning Session</span>
                <span className="font-black text-green-600 text-lg">
                  {morningStart} - {morningEnd}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-300">
                <span className="font-semibold text-gray-700">🌆 Evening Session</span>
                <span className="font-black text-blue-600 text-lg">
                  {eveningStart} - {eveningEnd}
                </span>
              </div>
              <div className="border-t border-green-300 pt-3 mt-3">
                <p className="text-sm text-green-800 font-semibold">
                  ⏱️ Total Operating Hours: 
                  <span className="ml-2 font-black">
                    {(parseInt(morningEnd.replace(':', '')) - parseInt(morningStart.replace(':', ''))) / 100} + {(parseInt(eveningEnd.replace(':', '')) - parseInt(eveningStart.replace(':', ''))) / 100} hours
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  💾 Save Time Settings
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={fetchSettings}
              className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </Card>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <h3 className="text-lg font-black text-purple-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> How It Works
        </h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="text-xl">✓</span>
            <span>Set the <strong>morning time slot</strong> for library opening to lunchtime (e.g., 6:00 AM to 12:00 PM)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">✓</span>
            <span>Set the <strong>evening time slot</strong> for afternoon to closing time (e.g., 2:00 PM to 8:00 PM)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">✓</span>
            <span>Times must be in <strong>24-hour format</strong> (e.g., 14:00 for 2:00 PM, 20:00 for 8:00 PM)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">✓</span>
            <span>Start time must always be <strong>before end time</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">✓</span>
            <span>All changes are logged with timestamp and admin name for audit purposes</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default LibrarySettings;
