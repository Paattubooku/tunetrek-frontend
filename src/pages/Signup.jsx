import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config/api.js';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success
            // navigate('/login'); // Removed direct navigation
            alert("Registration successful! You can now log in.");
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-[#050505] overscroll-none">
            {/* Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-[#0a0a0a] dark:to-black"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
                <div className="absolute top-[30%] left-[30%] w-[30vw] h-[30vw] bg-pink-500/15 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-50"></div>

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stichTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}></div>
            </div>

            {/* Floating 3D Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[15%] left-[10%] w-24 h-24 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md rotate-12 animate-float shadow-xl hidden lg:block"></div>
                <div className="absolute bottom-[20%] right-[10%] w-32 h-32 rounded-full border border-white/20 bg-white/5 backdrop-blur-md animate-float animation-delay-2000 shadow-xl hidden lg:block"></div>
                <div className="absolute top-[40%] right-[20%] w-12 h-12 border-2 border-primary/20 rounded-full animate-float animation-delay-4000 hidden lg:block"></div>
            </div>

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-[380px]">
                <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#121212]/60 border border-white/50 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/50 rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 animate-in zoom-in-95 fade-in duration-700 ring-1 ring-white/20">

                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-500 shadow-xl shadow-primary/30 mb-1 transform hover:scale-110 transition-transform duration-500 rotate-3 hover:rotate-6 group">
                            <span className="material-icons-round text-3xl text-white group-hover:rotate-12 transition-transform duration-500">person_add</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Create Account</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Join TuneTrek and start your journey</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
                            <span className="material-icons-round text-lg shrink-0">error_outline</span>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="flex flex-col gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-2 opacity-80">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round text-lg z-20">person</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="relative z-10 w-full bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-primary/50 dark:focus:border-primary/50 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-2 opacity-80">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
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

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-2 opacity-80">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round text-lg z-20">lock_outline</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="relative z-10 w-full bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-primary/50 dark:focus:border-primary/50 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-2 opacity-80">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round text-lg z-20">lock</span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="relative z-10 w-full bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-primary/50 dark:focus:border-primary/50 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full bg-gradient-to-r from-primary to-purple-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-1 text-sm"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <span className="material-icons-round text-lg">arrow_forward</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                        Already have an account? <Link to="/login" className="text-primary hover:text-purple-500 font-bold hover:underline transition-colors">Sign in</Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
