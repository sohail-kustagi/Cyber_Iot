import { AppShell } from '@/app/components/AppShell';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { endpoints } from '@/app/api';

export default function Graphs() {
  const [dateRange, setDateRange] = useState('Last 50 Points');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${endpoints.dashboardHistory}?limit=50`);
        if (!response.ok) throw new Error('Failed to fetch history');

        const result = await response.json();
        if (result.success && Array.isArray(result.history)) {
          // Helper for consistent battery calculation (matches Dashboard.tsx)
          const getLiIonCapacity = (voltage: number) => {
            const minVoltage = 9.6;
            const maxVoltage = 12.6;

            if (voltage <= minVoltage) return 0;
            if (voltage >= maxVoltage) return 100;

            const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
            return Math.min(Math.max(Math.round(percentage), 0), 100);
          };

          // Process data for charts
          // API returns newest first, we need oldest first for charts
          const processedData = result.history.reverse().map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            voltage: item.voltage,
            current: item.current < 0.3 ? 0.0 : item.current, // Filter noise
            batteryLevel: getLiIonCapacity(item.voltage) // Recalculate to ensure consistency
          }));
          setData(processedData);
        }
      } catch (err) {
        console.error('Error fetching graph data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A]/95 border border-[#00FF66]/30 rounded-lg p-3 shadow-[0_0_20px_rgba(0,255,102,0.2)]">
          <p className="text-[#E8E8E8] font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AppShell pageTitle="Analytics & History">
      <div className="space-y-6">
        {/* Date Range Controls */}
        <div className="flex justify-between items-center">
          <div className="text-[#888888]">Historical Data Visualization</div>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-[#0A0A0A]/80 border border-[#00FF66]/20 rounded-lg px-4 py-2 pr-10 text-[#E8E8E8] focus:outline-none focus:ring-2 focus:ring-[#00FF66] cursor-pointer"
            >
              <option>Last 50 Points</option>
              {/* Other options would require backend support for time-range filtering */}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" />
          </div>
        </div>

        {/* Voltage & Current Trends Chart */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-6">Voltage & Current Trends</h3>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#888888]">Loading data...</div>
            ) : data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#888888]">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00FF66" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    stroke="#888888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#888888"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: '#888888' }}
                    domain={[10, 15]} // Optimize scale for 12V system
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#888888"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Current (A)', angle: 90, position: 'insideRight', fill: '#888888' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ color: '#E8E8E8' }}
                    iconType="line"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="voltage"
                    name="Voltage"
                    unit=" V"
                    stroke="#00FF66"
                    strokeWidth={2}
                    fill="url(#voltageGradient)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="current"
                    name="Current"
                    unit=" A"
                    stroke="#00D9FF"
                    strokeWidth={2}
                    fill="url(#currentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Battery Level History Chart (Replaces Charge/Discharge) */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/20 rounded-lg p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-[#E8E8E8] mb-6">Battery Level History</h3>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#888888]">Loading data...</div>
            ) : data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#888888]">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    stroke="#888888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#888888"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Capacity (%)', angle: -90, position: 'insideLeft', fill: '#888888' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ color: '#E8E8E8' }}
                    iconType="line"
                  />
                  <Area
                    type="monotone"
                    dataKey="batteryLevel"
                    name="Battery"
                    unit="%"
                    stroke="#EAB308"
                    strokeWidth={2}
                    fill="url(#batteryGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
