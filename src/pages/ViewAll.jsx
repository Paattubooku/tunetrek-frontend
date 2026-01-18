import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';

export default function ViewAll() {
    const location = useLocation();
    const navigate = useNavigate();
    const { title, items } = location.state || {};

    useEffect(() => {
        if (!items) {
            navigate('/');
        }
    }, [items, navigate]);

    if (!items) return null;

    return (
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-32 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all text-slate-800 dark:text-white"
                >
                    <span className="material-icons-round text-xl">arrow_back</span>
                </button>
                <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">All Items</span>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{title}</h1>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 animate-in fade-in zoom-in-95 duration-500 delay-100">
                {items.map((item, index) => (
                    <Link
                        to={`/${item.type}/${extractIdFromUrl(item.perma_url) || item.id}`} // Default to album/song view
                        key={item.id}
                        className="group cursor-pointer rounded-3xl p-3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-300"
                        style={{ animationDelay: `${index * 30}ms` }}
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden relative mb-4 shadow-md group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                            <img
                                src={getHighQualityImage(item.image)}
                                alt={item.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex justify-end transform translate-y-4 group-hover:translate-y-0">
                                <button className="bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                                    <span className="material-icons-round text-2xl">play_arrow</span>
                                </button>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="px-1">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-[15px] group-hover:text-primary transition-colors">{item.title}</h4>
                            <p className="text-xs text-slate-500 font-medium truncate mt-1 opacity-80">
                                {item.subtitle || item.description || (item.artists && item.artists.map(a => a.name).join(', ')) || 'Mix'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
