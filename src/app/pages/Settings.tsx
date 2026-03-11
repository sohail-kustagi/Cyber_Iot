import { AppShell } from '@/app/components/AppShell';
import { Slider } from '@radix-ui/react-slider';
import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [wifiSsid, setWifiSsid] = useState('SolarNode-Network');
  const [wifiPassword, setWifiPassword] = useState('••••••••');
  const [lowVoltageAlarm, setLowVoltageAlarm] = useState([11.0]);
  const [apiKey] = useState('your_api_key_here');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
  };

  return (
    <AppShell pageTitle="Device Configuration">
      <div className="max-w-4xl space-y-6">
        {/* Network Settings */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-6">Network Settings</h3>

          <div className="space-y-4">
            {/* WiFi SSID */}
            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                WiFi SSID
              </label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#00FF66]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00FF66] focus:border-transparent transition-all"
              />
            </div>

            {/* WiFi Password */}
            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                WiFi Password
              </label>
              <input
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#00FF66]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00FF66] focus:border-transparent transition-all"
              />
            </div>

            {/* Save Button */}
            <button className="px-6 py-2 bg-[#00FF66] text-[#0A0A0A] rounded-lg font-medium hover:bg-[#00FF66]/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]">
              Save Network Settings
            </button>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-6">Alert Thresholds</h3>

          <div className="space-y-6">
            {/* Low Voltage Alarm */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-[#E8E8E8]">
                  Low Voltage Alarm
                </label>
                <span className="text-[#00D9FF] font-medium">{lowVoltageAlarm[0].toFixed(1)} V</span>
              </div>

              <Slider
                value={lowVoltageAlarm}
                onValueChange={setLowVoltageAlarm}
                min={10}
                max={13}
                step={0.1}
                className="relative flex items-center select-none touch-none w-full h-5"
              >
                <span className="relative flex-grow h-2 bg-[#1A1A1A] rounded-full">
                  <span
                    className="absolute h-full bg-gradient-to-r from-[#00FF66] to-[#00D9FF] rounded-full"
                    style={{ width: `${((lowVoltageAlarm[0] - 10) / 3) * 100}%` }}
                  />
                </span>
                <span className="block w-5 h-5 bg-[#00FF66] rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)] cursor-pointer" />
              </Slider>

              <div className="flex justify-between mt-2 text-xs text-[#666666]">
                <span>10.0 V</span>
                <span>13.0 V</span>
              </div>
            </div>

            <button className="px-6 py-2 bg-[#00FF66] text-[#0A0A0A] rounded-lg font-medium hover:bg-[#00FF66]/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]">
              Save Thresholds
            </button>
          </div>
        </div>

        {/* API Access */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-6">API Access</h3>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-[#00FF66]/20 rounded-lg text-[#E8E8E8] font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-white/5 border border-[#00FF66]/20 rounded-lg text-[#E8E8E8] hover:bg-white/10 hover:border-[#00FF66]/40 transition-all"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-[#888888]">
                Keep this key secure. It provides full access to your device API.
              </p>
            </div>

            {/* Regenerate Button */}
            <button className="flex items-center gap-2 px-6 py-2 bg-[#00D9FF] text-[#0A0A0A] rounded-lg font-medium hover:bg-[#00D9FF]/90 transition-all shadow-[0_0_15px_rgba(0,217,255,0.3)]">
              <RefreshCw className="w-4 h-4" />
              Regenerate Key
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#FF0055]/40 rounded-lg p-6 shadow-[0_0_20px_rgba(255,0,85,0.1)]">
          <h3 className="text-lg font-semibold text-[#FF0055] mb-6">Danger Zone</h3>

          <div className="space-y-4">
            <p className="text-sm text-[#888888]">
              Rebooting the device will temporarily disconnect all services. The device will restart automatically.
            </p>

            <button className="px-6 py-2 bg-transparent border-2 border-[#FF0055] text-[#FF0055] rounded-lg font-medium hover:bg-[#FF0055]/10 transition-all shadow-[0_0_15px_rgba(255,0,85,0.2)]">
              Reboot ESP32 Device
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
