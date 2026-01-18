import React from 'react';

export default function PopularSection() {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Popular</h3>
                <span className="material-icons-round text-slate-400">more_horiz</span>
            </div>
            <div className="glass-panel-light dark:glass-panel bg-glass-light dark:bg-glass-dark p-2 rounded-2xl flex flex-col divide-y divide-white/5">
                <div className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-all group cursor-pointer">
                    <img alt="Song Art" className="w-12 h-12 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPFqtgVk1SHDU14wGnB-1WlDwO7t7P2djq1VZr-GW507tQ13h9s5aoJK4MqlLw44zem8UuvVriNIK5-m06Au2HzovJFVcswIGWOqnMQPbBTTdlKsobMEI9J7HsG_VJfTjaXvJpWsQrlcKX_BnFZ8xUqJ0uVV5ACVOBUBQTd8cN6-nW7Lhe2E5YkY-zo6urBh4KnMSDo45BbclBFymL0DX07zf43Lgm8iIJgnTD4m6yVOv3ykqcWJrao5xa9uSnPkS1KfyiAGE3BRU" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Starboy</p>
                        <p className="text-xs text-slate-500 truncate">The Weeknd, Daft Punk • 2023</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons-round text-slate-400 text-lg hover:text-white">favorite_border</span>
                        <span className="material-icons-round text-slate-400 text-lg hover:text-white">more_horiz</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-all group cursor-pointer">
                    <img alt="Song Art" className="w-12 h-12 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkknqOJCPeAVI-6KuZsE0DhpgQDubphlYHelaV2keJH0qZE3T78BVWiZ-cg7i0I1mYv9hckc8Z8dNi7BwLTdOnpWYJydPOK-MudsKBKoVNDXQsLMKjd1mAkTDO3n-R61ad3fAQazcMvWziHzYL5QUVY4NE8JhUZc9fuJte-XsDX0L9qA5N3oC4plYRNzbL7o8051fPQ21zh4H2ewgieQKPkrRv3pFG10_LWFL_KzZQk51eqdAtn4YbMkduS6whZqkmRgRQuaEod-o" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Blinding Lights</p>
                        <p className="text-xs text-slate-500 truncate">The Weeknd • 2023</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-red-500 text-lg">favorite</span>
                        <span className="material-icons-round text-slate-400 text-lg hover:text-white opacity-0 group-hover:opacity-100">more_horiz</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-all group cursor-pointer">
                    <img alt="Song Art" className="w-12 h-12 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZb_3MzjWAhAln6HBeckBUPBbjLPvNqpe0TwDkhNA3trMr0y6BQbrj1LNrpEpapLCwogIQVgWYHc4eC61fcjszVehC8vVFiIhXwpdmEDZzW7y8_dkS3WJEpQwBtivyh9c1aDyabvWPZluqHwwKbTrrM8dBrchcA6_wCy4w1EFrzRryHmDEaFpxNElVAD63fA7iEJ5uqvOoacD6xPi36L-rzGoIL2NDqWnHyCPm-fnSlOcx0ZlxiMuEr9_6C7ol_IJAXqo-L_mGloc" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">The Hills</p>
                        <p className="text-xs text-slate-500 truncate">The Weeknd • 2023</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons-round text-slate-400 text-lg hover:text-white">favorite_border</span>
                        <span className="material-icons-round text-slate-400 text-lg hover:text-white">more_horiz</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
