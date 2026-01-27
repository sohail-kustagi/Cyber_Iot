import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutGrid, TrendingUp, Settings, Bell, ChevronDown, Zap, LogOut } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  pageTitle: string;
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { path: '/graphs', label: 'Graphs', icon: TrendingUp },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A0A0A] border-r border-[#00FF66]/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#00FF66]/20">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <Zap className="w-8 h-8 text-[#00FF66] transition-transform group-hover:scale-110" fill="#00FF66" />
              <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-8 h-8 text-[#00FF66]" fill="#00FF66" />
              </div>
            </div>
            <span className="text-xl font-bold text-[#E8E8E8]">SolarNode</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                    : 'text-[#888888] hover:text-[#E8E8E8] hover:bg-white/5'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#00FF66]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#888888] hover:text-[#FF0055] hover:bg-[#FF0055]/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-[#FF0055]" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Bottom decoration */}
        <div className="px-4 pb-4">
          <div className="text-xs text-[#666666] text-center">
            v2.1.0 • Online
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#00FF66]/20 flex items-center justify-between px-6">
          {/* Page Title */}
          <h2 className="text-xl font-semibold text-[#E8E8E8]">{pageTitle}</h2>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-[#888888] hover:text-[#E8E8E8] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF0055] rounded-full"></span>
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF66] to-[#00D9FF] flex items-center justify-center text-[#0A0A0A] font-semibold">
                A
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-[#E8E8E8]">Admin User</div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#888888] group-hover:text-[#E8E8E8] transition-colors" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
