import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Zap } from 'lucide-react';
import { endpoints } from '@/app/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Login successful
      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF66] opacity-10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF] opacity-10 blur-[120px] rounded-full"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphic card with neon border */}
        <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00FF66]/30 rounded-lg p-8 shadow-[0_0_30px_rgba(0,255,102,0.15)]">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="w-10 h-10 text-[#00FF66]" fill="#00FF66" />
                <div className="absolute inset-0 blur-md">
                  <Zap className="w-10 h-10 text-[#00FF66]" fill="#00FF66" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#E8E8E8]">SolarNode</h1>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-[#E8E8E8] mb-2 text-center">
            Sign in to SolarNode
          </h2>
          <p className="text-[#888888] text-center mb-8">
            Access your IoT dashboard
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-[#FF0055]/10 border border-[#FF0055]/30 rounded-lg text-[#FF0055] text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#00FF66]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00FF66] focus:border-transparent transition-all"
                placeholder="admin@solarnode.io"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#00FF66]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00FF66] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[#00D9FF] hover:text-[#00FF66] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-[#00FF66] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#00FF66]/90 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Sign up Link */}
          <p className="mt-6 text-center text-sm text-[#888888]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/request-access')}
              className="text-[#00D9FF] hover:text-[#00FF66] transition-colors font-medium"
            >
              Request Access
            </button>
          </p>
        </div>

        {/* Glow effect underneath */}
        <div className="absolute inset-0 -z-10 bg-[#00FF66] opacity-20 blur-3xl rounded-lg transform scale-105"></div>
      </div>
    </div>
  );
}
