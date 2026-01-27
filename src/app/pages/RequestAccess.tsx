import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Zap, Send } from 'lucide-react';
import { endpoints } from '@/app/api';

export default function RequestAccess() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [reason, setReason] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(endpoints.requestAccess, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, reason }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setSubmitted(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            console.error('Request Access error:', err);
            setError(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
            {/* Background effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF66] opacity-10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00D9FF] opacity-10 blur-[120px] rounded-full"></div>
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md">
                {/* Glassmorphic card with neon border */}
                <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#00D9FF]/30 rounded-lg p-8 shadow-[0_0_30px_rgba(0,217,255,0.15)]">

                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-[#00FF66]/20 rounded-full flex items-center justify-center">
                                    <Send className="w-8 h-8 text-[#00FF66]" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-[#E8E8E8] mb-2">Request Sent</h2>
                            <p className="text-[#888888] mb-6">
                                Your access request has been submitted to the admin. You will receive an email once approved.
                            </p>
                            <p className="text-sm text-[#00D9FF]">Redirecting to login...</p>
                        </div>
                    ) : (
                        <>
                            {/* Logo */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Zap className="w-10 h-10 text-[#00D9FF]" fill="#00D9FF" />
                                        <div className="absolute inset-0 blur-md">
                                            <Zap className="w-10 h-10 text-[#00D9FF]" fill="#00D9FF" />
                                        </div>
                                    </div>
                                    <h1 className="text-3xl font-bold text-[#E8E8E8]">SolarNode</h1>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-semibold text-[#E8E8E8] mb-2 text-center">
                                Request Access
                            </h2>
                            <p className="text-[#888888] text-center mb-8">
                                Join the network to monitor device telemetry
                            </p>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-3 bg-[#FF0055]/10 border border-[#FF0055]/30 rounded-lg text-[#FF0055] text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-[#E8E8E8] mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-[#00D9FF]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

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
                                        className="w-full px-4 py-3 bg-white/5 border border-[#00D9FF]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:border-transparent transition-all"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                {/* Reason Field */}
                                <div>
                                    <label htmlFor="reason" className="block text-sm font-medium text-[#E8E8E8] mb-2">
                                        Reason for Access
                                    </label>
                                    <textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-[#00D9FF]/20 rounded-lg text-[#E8E8E8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:border-transparent transition-all resize-none"
                                        placeholder="Briefly explain why you need access..."
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 bg-[#00D9FF] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#00D9FF]/90 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Sending...' : 'Send Request'}
                                </button>
                            </form>

                            {/* Login Link */}
                            <p className="mt-6 text-center text-sm text-[#888888]">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="text-[#00FF66] hover:text-[#00D9FF] transition-colors font-medium"
                                >
                                    Back to Login
                                </button>
                            </p>
                        </>
                    )}
                </div>

                {/* Glow effect underneath */}
                <div className="absolute inset-0 -z-10 bg-[#00D9FF] opacity-20 blur-3xl rounded-lg transform scale-105"></div>
            </div>
        </div>
    );
}
