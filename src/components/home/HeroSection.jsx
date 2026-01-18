import React from 'react';

export default function HeroSection() {
    return (
        <section className="glass-panel-light dark:glass-panel bg-glass-light dark:bg-glass-dark p-8 rounded-2xl flex gap-8 items-center relative overflow-hidden shrink-0">
            <div className="flex-1 flex flex-col gap-6 z-10">
                <div className="space-y-1">
                    <h2 className="text-5xl font-extrabold tracking-tight">The Weeknd</h2>
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-icons-round text-sm">verified</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Verified Artist</span>
                    </div>
                </div>
                <p className="text-slate-400 max-w-md">The Weeknd has dominated the global music charts with hits like 'Blinding Lights' and 'Save Your Tears'. Experience his latest sonic journey.</p>
                <div className="flex items-center gap-4">
                    <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
                        <span className="material-icons-round">play_arrow</span>
                        Play
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-3 rounded-xl font-semibold border border-white/10 transition-all">
                        Following
                    </button>
                </div>
                <p className="text-xs text-slate-500">12.2M monthly listeners</p>
            </div>
            <div className="w-[450px] aspect-video rounded-2xl overflow-hidden shadow-2xl z-10">
                <img alt="Featured Artist" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKfCgJle9zbSzA77y1-FJo0FGm5aSjyku0yov_l7PKx0C-Ff-19y2A5CIV5tk9WgceUFuD3yYGffW447iHORtVOuRxQ0xq_OTAnGWjKIX6aPsRF3j-KUMMBWu-tdZJDIw-CvYprbWRPsSf34LzcNEBt0hIZLydHpC8FDIB9bo6pBG13NFnACvMsa_3oJckXyP8Uvq77iIL1Wr17b7tKWXyviHUEAx1bi9oKst_jQyocDVjweGddjL-l6pRST85avs82ycLB2jfeSs" />
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"></div>
        </section>
    );
}
