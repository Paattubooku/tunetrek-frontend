import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api.js';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.error || 'Request failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div className="h-screen w-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-[#050505]">
            {/* Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-[#0a0a0a] dark:to-black"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
            </div>

            <div className="relative z-10 w-full max-w-[380px]">
                <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#121212]/60 border border-white/50 dark:border-white/10 shadow-2xl rounded-[2rem] p-8 flex flex-col gap-6 ring-1 ring-white/20">

                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-2">
                            <span className="material-icons-round text-3xl text-white">lock_reset</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Forgot Password?</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email and we'll send you instructions to reset your password.</p>
                    </div>

                    {message && (
                        <div className={`px-4 py-3 rounded-xl text-xs flex items-center gap-2 ${status === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                            <span className="material-icons-round text-lg shrink-0">{status === 'success' ? 'check_circle' : 'error_outline'}</span>
                            <span className="font-medium">{message}</span>
                        </div>
                    )}

                    {status !== 'success' && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-2 opacity-80">Email Address</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round text-lg z-20">email</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="relative z-10 w-full bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-primary/50 dark:focus:border-primary/50 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="group relative w-full bg-gradient-to-r from-primary to-purple-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2 text-sm"
                            >
                                {status === 'loading' ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Link to="/login" className="flex items-center justify-center gap-1 hover:text-slate-800 dark:hover:text-white transition-colors">
                            <span className="material-icons-round text-base">arrow_back</span>
                            Back to Login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
