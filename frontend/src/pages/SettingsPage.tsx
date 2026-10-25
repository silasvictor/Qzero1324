import React, { useState } from 'react';
import { Settings, Sliders, Bell, Shield, Check, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [defaultDuplex, setDefaultDuplex] = useState(true);
  const [defaultColor, setDefaultColor] = useState(false);
  const [autoTrackingMargin, setAutoTrackingMargin] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Print & Security Settings</h2>
        <p className="text-xs text-brand-mutedText mt-0.5">
          Customize your default hardware printing configurations and dispatch alerts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-brand-cardBorder shadow-soft space-y-6">
        <div>
          <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-brand-purple" />
            <span>Default Printing Preferences</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-brand-dark">Default to Double-Sided Duplex</div>
                <div className="text-[11px] text-gray-500">Saves 50% paper and applies 15% eco-discount</div>
              </div>
              <input
                type="checkbox"
                checked={defaultDuplex}
                onChange={(e) => setDefaultDuplex(e.target.checked)}
                className="w-5 h-5 accent-brand-purple rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-brand-dark">Auto-Attach Removable Tracking-Code Margin</div>
                <div className="text-[11px] text-gray-500">Prepares bottom perforated strip for sealed envelopes</div>
              </div>
              <input
                type="checkbox"
                checked={autoTrackingMargin}
                onChange={(e) => setAutoTrackingMargin(e.target.checked)}
                className="w-5 h-5 accent-brand-purple rounded"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-lavender">
          <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-brand-purple" />
            <span>Notification & Dispatch Channels</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-brand-dark">SMS Pickup Alerts</div>
                <div className="text-[11px] text-gray-500">Receive instant SMS token when envelope is sealed in tray</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-brand-purple rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-brand-dark">Email Invoices & Financial Receipts</div>
                <div className="text-[11px] text-gray-500">Auto-send PDF audit receipts to registered university email</div>
              </div>
              <input
                type="checkbox"
                checked={emailReceipts}
                onChange={(e) => setEmailReceipts(e.target.checked)}
                className="w-5 h-5 accent-brand-purple rounded"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-lavender flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          ) : (
            <span className="text-[11px] text-gray-400">Settings persist in your browser profile.</span>
          )}

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
