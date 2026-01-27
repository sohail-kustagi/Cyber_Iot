import { AppShell } from '@/app/components/AppShell';
import { Battery, Zap, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { useState, useEffect } from 'react';

// Define the shape of our API data
interface TelemetryData {
  voltage: number;
  current: number;
  // timestamp: number; // Optional in user req, but useful
}

export default function Dashboard() {
  // State for data from the Server
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [inverterMode, setInverterMode] = useState(false);
  const [lastActivity, setLastActivity] = useState<string>('Waiting for update...');
  const [activityLog, setActivityLog] = useState<{ time: string, event: string, details: string, color: string }[]>([]);

  // 1. POLLING: Fetch Data every 2 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use direct URL as requested by user
        const response = await fetch('http://localhost:5000/api/dashboard');
        const data = await response.json();

        // Update Live Numbers
        if (data.telemetry) {
          setTelemetry(data.telemetry);

          // Update activity log with telemetry updates (throttled/filtered in real app, but showing here)
          const timeStr = new Date().toLocaleTimeString();
          // Only add if it's new data or every so often? For now, let's just update the "last updated" text
        }

        // Sync Switch State (unless user is interacting, but here we just take server truth)
        if (data.system && data.system.inverterRelayOn !== undefined) {
          setInverterMode(data.system.inverterRelayOn);
        }

        setLastActivity(new Date().toLocaleTimeString());

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    // Run immediately and then every 2 seconds
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. CONTROL: Send Command when Switch is clicked
  const handleToggle = async (checked: boolean) => {
    // 1. Update UI instantly (Optimistic update)
    setInverterMode(checked);

    // 2. Tell the Server
    try {
      await fetch('http://localhost:5000/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inverterRelayOn: checked }),
      });

      // Add to local activity log for feedback
      setActivityLog(prev => [{
        time: new Date().toLocaleTimeString(),
        event: 'Control Action',
        details: `Relay switched to ${checked ? 'Battery' : 'Grid'}`,
        color: '#00D9FF'
      }, ...prev].slice(0, 10));

      console.log("Command sent:", checked);
    } catch (error) {
      console.error("Failed to send command:", error);
      // Revert UI if it failed
      setInverterMode(!checked);
    }
  };

  // Helper for Battery Percentage (3S Li-Ion: 9.6V - 12.6V)
  const getLiIonCapacity = (voltage: number) => {
    const max = 12.6;
    const min = 9.6;
    if (voltage >= max) return 100;
    if (voltage <= min) return 0;
    return Math.round(((voltage - min) / (max - min)) * 100);
  };

  // Helper for "Ghost Current" filtering (< 0.3A becomes 0.0A)
  const getCurrent = (amps: number) => {
    return amps < 0.3 ? 0.0 : amps;
  };

  // Status Logic
  const status = telemetry ? {
    text: 'Online',
    sub: inverterMode ? 'Running on Battery' : 'Bypass Mode',
    color: '#00FF66',
    icon: CheckCircle
  } : {
    text: 'Offline',
    sub: 'No Coonection',
    color: '#FF0055',
    icon: AlertTriangle
  };


  return (
    <AppShell pageTitle="System Overview">
      <div className="space-y-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Voltage Card */}
          <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 hover:border-[#00FF66]/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-[#00FF66]/10">
              <Battery className="w-6 h-6 text-[#00FF66]" />
            </div>
            <div className="text-sm text-[#888888] mb-1">Battery Voltage</div>
            <div className="text-2xl font-bold text-[#E8E8E8]">
              {telemetry ? telemetry.voltage.toFixed(1) : '--'} V
            </div>
          </div>

          {/* Current Card */}
          <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 hover:border-[#00FF66]/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-[#FF6B00]/10">
              <Zap className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <div className="text-sm text-[#888888] mb-1">Current Draw</div>
            <div className="text-2xl font-bold text-[#E8E8E8]">
              {telemetry ? getCurrent(telemetry.current).toFixed(1) : '--'} A
            </div>
          </div>

          {/* Capacity Card */}
          <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 hover:border-[#00FF66]/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-[#00D9FF]/10">
              <Activity className="w-6 h-6 text-[#00D9FF]" />
            </div>
            <div className="text-sm text-[#888888] mb-1">Est. Capacity</div>
            <div className="text-2xl font-bold text-[#E8E8E8]">
              {telemetry ? getLiIonCapacity(telemetry.voltage) : '--'}%
            </div>

            {/* Progress Ring */}
            {telemetry && (
              <div className="absolute top-4 right-4">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="4" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke="#00D9FF" strokeWidth="4" fill="none" strokeDasharray={`${getLiIonCapacity(telemetry.voltage) * 1.76} ${100 * 1.76}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#00D9FF] transform rotate-0">
                  {getLiIonCapacity(telemetry.voltage)}%
                </div>
              </div>
            )}
          </div>

          {/* Status Card */}
          <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 hover:border-[#00FF66]/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${status.color}1A` }}>
              <status.icon className="w-6 h-6" style={{ color: status.color }} />
            </div>
            <div className="text-sm text-[#888888] mb-1">System Status</div>
            <div className="text-2xl font-bold text-[#E8E8E8]">{status.text}</div>
            <div className="text-xs" style={{ color: status.color }}>{status.sub}</div>
            <div className="text-[10px] text-gray-500 mt-1">Updated: {lastActivity}</div>
          </div>
        </div>

        {/* Quick Action Card (The Magic Switch) */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-4">Quick Actions</h3>
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-lg border border-[#00FF66]/10">
            <div>
              <div className="text-[#E8E8E8] font-medium mb-1">Inverter Relay Mode</div>
              <div className="text-sm text-[#888888]">
                Status: <span className={inverterMode ? "text-[#00FF66]" : "text-gray-500"}>
                  {inverterMode ? 'Battery active' : 'Grid active'}
                </span>
              </div>
            </div>

            <Switch
              checked={inverterMode}
              onCheckedChange={handleToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${inverterMode ? 'bg-[#00FF66]' : 'bg-[#1A1A1A]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${inverterMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </Switch>
          </div>
        </div>

        {/* System Activity Table (Optional but good to keep) */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-4">System Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#00FF66]/10 text-[#666666] text-sm">
                  <th className="pb-3 pl-4">Time</th>
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activityLog.length > 0 ? activityLog.map((log, i) => (
                  <tr key={i} className="border-b border-[#00FF66]/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pl-4 text-[#888888]">{log.time}</td>
                    <td className="py-3 font-medium" style={{ color: log.color }}>{log.event}</td>
                    <td className="py-3 text-[#E8E8E8]">{log.details}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-4 text-center text-[#666666]">No recent actions...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
