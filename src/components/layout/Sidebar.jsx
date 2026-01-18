import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col gap-6 w-60 shrink-0 h-full transition-all duration-300">
                <div className="glass-panel-light dark:glass-panel bg-glass-light dark:bg-glass-dark p-6 rounded-2xl flex flex-col gap-4 ">
                    <Link to="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/30">
                            <span className="material-icons-round text-2xl">graphic_eq</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">TuneTrek</h1>
                    </Link>
                    <nav className="space-y-2 flex-1">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white"
                                }`
                            }
                        >
                            <span className="material-icons-round">home</span>
                            Home
                        </NavLink>
                        <a className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all text-slate-500 font-bold dark:text-slate-400 dark:hover:text-white" href="#">
                            <span className="material-icons-round">radio</span>
                            Radio
                        </a>
                        <NavLink
                            to="/library"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white"
                                }`
                            }
                        >
                            <span className="material-icons-round">library_music</span>
                            Library
                        </NavLink>
                    </nav>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span className="material-icons-round text-2xl">home</span>
                    <span className="text-[10px] font-bold">Home</span>
                </NavLink>
                <NavLink
                    to="/library"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span className="material-icons-round text-2xl">library_music</span>
                    <span className="text-[10px] font-bold">Library</span>
                </NavLink>
            </nav>
        </>
    );

}
