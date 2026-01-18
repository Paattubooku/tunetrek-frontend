import React from 'react';

export default function FansAlsoLike() {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Fans Also Like</h3>
                <button className="text-xs text-slate-500 hover:text-primary transition-colors">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel-light dark:glass-panel bg-glass-light dark:bg-glass-dark p-4 rounded-2xl group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                        <img alt="Justin Bieber Album" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYmgDGbLwLhScvLhq3vwLAbdIz_CjEfYxLjKFqhesW-dkZ5A3iW3edlgCHj8cJR4OZcFdXdCxS8mJJ5hl_6jC-vLnUH7eQMSi3GrQiQvWskNFZIQyXJGpxkBgNL_E7bMdekrzh7kmE8R-sDZizJxZJA10JyeN-VDI_rg88meqjwj4PXNHG03L0NFqsloKO86riFao7xNytj87kYIvaDYjjOuDxCqimcGQugNUGmU3m9G-PLvCIspJZtP75MhBG0RyFy1T4BCraf3I" />
                    </div>
                    <h4 className="font-semibold text-sm">Justin Bieber</h4>
                    <p className="text-xs text-slate-500">16 Tracks</p>
                </div>
                <div className="glass-panel-light dark:glass-panel bg-glass-light dark:bg-glass-dark p-4 rounded-2xl group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                        <img alt="Ed Sheeran Album" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_3As3xnin8yrBHl8Yc1X6T77Y0jh__qLA82b1CVB6-IkYD1LeSAxvLe-ktMSOKZGYI-vU9ExY_HX-dluBdWepvguRaDZUzOdqP9QBdaQU1IlTe25DAdBFFhMTs7jUSDpOKgbMH_f736TI6dC342_KW4cpxe_2kAjLRkKv1trq7cvNl1nj4qLxtrechFHrN85tFvcDwH7ZTlxFTYYw2mlPRXhwVzpZM6UGVl1LsS8zut5pQojSlre5aIM4G9Uxj05RcJ85Kh1oBtw" />
                    </div>
                    <h4 className="font-semibold text-sm">Ed Sheeran</h4>
                    <p className="text-xs text-slate-500">19 Tracks</p>
                </div>
            </div>
        </section>
    );
}
