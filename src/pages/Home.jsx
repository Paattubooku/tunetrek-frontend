import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { useSelector } from 'react-redux';
import { getRecentlyPlayed } from '../utils/recentlyPlayedUtils';
import API_URL from '../config/api.js';


export default function Home() {
    const dispatch = useAppDispatch();
    const { selectedLanguages } = useOutletContext();
    const { user } = useSelector(state => state.auth);
    const [homeData, setHomeData] = useState(null);
    const [recentTracks, setRecentTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const langParam = selectedLanguages && selectedLanguages.length > 0 ? selectedLanguages.join(',') : 'tamil,english';

                const response = await fetch(`${API_URL}/?language=${langParam}`);
                const data = await response.json();


                // Extract location metadata
                if (data._metadata) {
                    delete data._metadata; // Remove metadata from homeData
                }

                setHomeData(data);

                // Fetch Recently Played
                if (user?.id) {
                    const recent = await getRecentlyPlayed(user.id);
                    setRecentTracks(recent);
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [selectedLanguages, user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (!homeData || Object.keys(homeData).length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                <span className="material-icons-round text-6xl opacity-20">graphic_eq</span>
                <p>No vibes found. Try different languages.</p>
            </div>
        )
    }

    const getItemLink = (item) => {
        const id = extractIdFromUrl(item.perma_url) || item.id;
        if (item.type === 'song') return '#';
        if (item.type === 'artist') {
            return `/artist/${id}`;
        }
        if (item.type === 'playlist' || item.type === 'mix') {
            return `/playlist/${id}`;
        }
        return `/album/${id}`;
    };

    const handleCardClick = (e, item) => {
        if (item.type === 'song') {
            e.preventDefault();
            dispatch(setCurrentTrack(item));
            dispatch(setQueue([item]));
        }
    };

    const renderSection = (title, items, index) => {
        if (!items || items.length === 0) return null;

        // Visual Stagger Delay
        const delayClass = `delay-[${index * 100}ms]`;

        // VARIANT 1: HORIZONTAL SCROLL (New Releases, Radio, Recently Played)
        if (title.toLowerCase().includes('new') || title.toLowerCase().includes('radio') || title.toLowerCase().includes('recently')) {
            return (
                <section key={title} className={`flex flex-col gap-6 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards ${delayClass}`}>
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 capitalize flex items-center gap-3">
                            {title}
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent w-full min-w-[100px]"></div>
                        </h3>
                        <Link
                            to="/view-all"
                            state={{ title, items }}
                            className="text-xs font-bold text-slate-400 hover:text-primary transition-colors tracking-wide uppercase flex items-center gap-1"
                        >
                            See All
                            <span className="material-icons-round text-sm">chevron_right</span>
                        </Link>
                    </div>

                    <div className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-2 px-6">
                        {items.map((item, i) => (
                            <Link
                                to={getItemLink(item)}
                                key={item.id}
                                onClick={(e) => handleCardClick(e, item)}
                                className="snap-center shrink-0 w-48 group cursor-pointer flex flex-col gap-4 relative"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="aspect-square rounded-3xl overflow-hidden relative shadow-lg group-hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.3)] transition-all duration-500 z-10">
                                    <img
                                        src={getHighQualityImage(item.image)}
                                        alt={item.title}
                                        loading="lazy"
                                        className={`w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out ${item.type === 'artist' ? 'rounded-full' : ''}`}
                                    />
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-xl scale-50 group-hover:scale-100 transition-all duration-500 hover:bg-primary hover:border-primary">
                                            <span className="material-icons-round text-3xl ml-1">
                                                {item.type === 'artist' ? 'person' : 'play_arrow'}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                                        {item.type || 'Album'}
                                    </span>
                                </div>

                                <div className="px-1 relative z-20 group-hover:-translate-y-1 transition-transform duration-300">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-base group-hover:text-primary transition-colors">{item.title}</h4>
                                    <p className="text-xs text-slate-500 font-medium truncate mt-1">{item.subtitle || item.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            );
        }

        // VARIANT 2: PREMIUM CAROUSEL (Charts, Top Hits)
        if (title.toLowerCase().includes('charts') || title.toLowerCase().includes('top')) {
            return (
                <section key={title} className={`flex flex-col gap-3 md:gap-4 py-3 md:py-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards ${delayClass}`}>
                    <div className="flex items-center justify-between px-1 md:px-2">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="relative hidden sm:block">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg blur-sm opacity-30 animate-pulse"></div>
                                <span className="relative p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md flex">
                                    <span className="material-icons-round text-base md:text-lg">emoji_events</span>
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-medium mt-0.5 hidden sm:block">Top trending tracks</p>
                            </div>
                        </div>
                        <Link
                            to="/view-all"
                            state={{ title, items }}
                            className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-primary transition-colors tracking-wide uppercase flex items-center gap-0.5 md:gap-1"
                        >
                            <span className="hidden sm:inline">See All</span>
                            <span className="material-icons-round text-sm">chevron_right</span>
                        </Link>
                    </div>

                    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-6 hide-scrollbar snap-x snap-mandatory -mx-1 md:-mx-2 px-3 md:px-6">
                        {items.slice(0, 10).map((item, idx) => (
                            <Link
                                to={getItemLink(item)}
                                key={item.id}
                                onClick={(e) => handleCardClick(e, item)}
                                className="snap-center shrink-0 w-40 sm:w-48 md:w-56 group cursor-pointer relative"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="relative h-52 sm:h-64 md:h-72 rounded-xl md:rounded-2xl overflow-hidden shadow-md md:shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
                                    {/* Background Image */}
                                    <img
                                        src={getHighQualityImage(item.image)}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    />

                                    {/* Gradient Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    {/* Ranking Badge */}
                                    <div className="absolute top-2 md:top-3 left-2 md:left-3 z-20">
                                        <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl font-black text-lg sm:text-xl md:text-2xl italic ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg md:shadow-xl shadow-yellow-500/40' :
                                            idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-lg md:shadow-xl shadow-slate-400/40' :
                                                idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg md:shadow-xl shadow-orange-500/40' :
                                                    'bg-white/20 backdrop-blur-md text-white border border-white/30'
                                            }`}>
                                            {idx + 1}
                                            {idx < 3 && (
                                                <span className="absolute -top-0.5 md:-top-1 -right-0.5 md:-right-1 material-icons-round text-xs md:text-sm animate-bounce">
                                                    star
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/40 text-white shadow-lg md:shadow-xl scale-50 group-hover:scale-100 transition-all duration-500 hover:bg-primary hover:border-primary">
                                            <span className="material-icons-round text-xl sm:text-2xl md:text-3xl ml-0.5">play_arrow</span>
                                        </div>
                                    </div>


                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 z-20 transform group-hover:-translate-y-1 transition-transform duration-500">
                                        <div className="space-y-1 md:space-y-1.5">
                                            <h4 className="font-bold text-white text-sm sm:text-base md:text-lg leading-tight line-clamp-2 drop-shadow-lg">
                                                {item.title}
                                            </h4>
                                            <p className="text-slate-300 text-[10px] sm:text-xs font-medium line-clamp-1 drop-shadow">
                                                {item.subtitle}
                                            </p>

                                            {/* Stats Bar */}
                                            <div className="hidden sm:flex items-center gap-2 md:gap-3 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                <div className="flex items-center gap-0.5 md:gap-1 text-white/80">
                                                    <span className="material-icons-round text-[10px] md:text-xs">trending_up</span>
                                                    <span className="text-[9px] md:text-[10px] font-bold">Trending</span>
                                                </div>
                                                <div className="h-0.5 w-0.5 md:h-1 md:w-1 rounded-full bg-white/40"></div>
                                                <div className="flex items-center gap-0.5 md:gap-1 text-white/80">
                                                    <span className="material-icons-round text-[10px] md:text-xs">play_circle</span>
                                                    <span className="text-[9px] md:text-[10px] font-bold">{item.type || 'Song'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            );
        }

        // VARIANT 3: UNIFORM VIBRANT GRID (Mood & Default)
        return (
            <section key={title} className={`flex flex-col gap-3 md:gap-4 py-3 md:py-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards ${delayClass}`}>
                <div className="flex items-center justify-between px-1 md:px-2">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-0.5 md:w-1 h-5 md:h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full"></div>
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white capitalize tracking-tight">{title}</h3>
                    </div>
                    <Link
                        to="/view-all"
                        state={{ title, items }}
                        className="group flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
                    >
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Explore</span>
                        <span className="material-icons-round text-[10px] md:text-xs transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.slice(0, 8).map((item, idx) => {
                        // Create varying card sizes for bento-box effect
                        const isLarge = idx === 0 || idx === 5;
                        const isMedium = idx === 2 || idx === 7;

                        // Vibrant gradient colors for mood
                        const gradients = [
                            'from-pink-500/90 to-rose-500/90',
                            'from-purple-500/90 to-indigo-500/90',
                            'from-blue-500/90 to-cyan-500/90',
                            'from-green-500/90 to-emerald-500/90',
                            'from-yellow-500/90 to-orange-500/90',
                            'from-red-500/90 to-pink-500/90',
                            'from-indigo-500/90 to-purple-500/90',
                            'from-teal-500/90 to-green-500/90',
                        ];

                        return (
                            <Link
                                to={getItemLink(item)}
                                key={item.id}
                                onClick={(e) => handleCardClick(e, item)}
                                className="group cursor-pointer flex flex-col gap-2 md:gap-3"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-sm md:shadow-md group-hover:shadow-lg md:group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                                    {/* Background Image */}
                                    <img
                                        src={getHighQualityImage(item.image)}
                                        alt={item.title}
                                        loading="lazy"
                                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${item.type === 'artist' ? 'rounded-full' : ''}`}
                                    />

                                    {/* Vibrant Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} mix-blend-multiply opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>

                                    {/* Dark Gradient for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/60 text-white shadow-lg md:shadow-xl scale-75 group-hover:scale-100 transition-all duration-500 hover:bg-white hover:text-primary">
                                            <span className="material-icons-round text-xl sm:text-2xl md:text-2xl ml-0.5">
                                                {item.type === 'artist' ? 'person' : 'play_arrow'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-2 right-2 z-20">
                                        <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg">
                                            {item.type || 'Mix'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20 transform group-hover:-translate-y-1 transition-transform duration-500">
                                        <div className="space-y-1">
                                            <h4 className={`font-black text-white leading-tight ${isLarge ? 'text-2xl line-clamp-2' : 'text-lg line-clamp-1'} drop-shadow-lg`}>
                                                {item.title}
                                            </h4>
                                            {(isLarge || isMedium) && (
                                                <p className="text-white/90 text-sm font-medium line-clamp-1 drop-shadow">
                                                    {item.subtitle || item.description || 'Curated playlist'}
                                                </p>
                                            )}

                                            {/* Animated Underline */}
                                            <div className="w-0 group-hover:w-8 h-0.5 bg-white rounded-full transition-all duration-500 mt-1.5"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar flex flex-col gap-8 pb-32">

            {/* Ambient Background Gradient Spots */}
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-purple-50/20 to-pink-50/20 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>

                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                    }}></div>
                </div>
            </div>

            {/* Header Greeting Area */}
            <div className="px-2 pt-6 pb-2 relative">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400 dark:from-white dark:to-slate-500 tracking-tighter drop-shadow-sm animate-in slide-in-from-left-4 duration-1000">
                    {getGreeting()}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1 animate-in slide-in-from-left-4 duration-1000 delay-100">
                    Ready to discover your next obsession?
                </p>
            </div>

            {/* Massive Hero Card */}
            {homeData["Trending Now"] && homeData["Trending Now"].data && (
                <section className="mx-2 shrink-0 animate-in fade-in zoom-in-95 duration-1000 fill-mode-backwards delay-200">
                    <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/20">
                        {/* Dynamic Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={getHighQualityImage(homeData["Trending Now"].data[0].image)}
                                alt="Hero"
                                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out brightness-75"
                            />
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
                        </div>

                        {/* Content Layer */}
                        <div className="absolute inset-x-0 bottom-0 top-0 p-8 md:p-16 flex flex-col justify-end items-start z-10">
                            <div className="space-y-6 max-w-3xl transform group-hover:-translate-y-2 transition-transform duration-500">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">Trending #1</span>
                                </div>

                                <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tight drop-shadow-2xl">
                                    {homeData["Trending Now"].data[0].title}
                                </h2>

                                <p className="text-slate-300 text-xl font-medium line-clamp-2 max-w-2xl drop-shadow-lg">
                                    {homeData["Trending Now"].data[0].subtitle}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-4 opacity-100 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    <button
                                        onClick={() => handleCardClick({ preventDefault: () => { } }, { ...homeData["Trending Now"].data[0], type: 'song' })}
                                        className="bg-primary hover:bg-primary-focus text-white h-14 px-8 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-primary/40 hover:scale-105 active:scale-95 flex items-center gap-3"
                                    >
                                        <span className="material-icons-round text-2xl">play_circle_filled</span>
                                        Play Now
                                    </button>
                                    <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all">
                                        <span className="material-icons-round text-2xl">favorite_border</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Render Other Sections */}
            <div className="flex flex-col pb-12">
                {recentTracks.length > 0 && renderSection('Recently Played', recentTracks, -1)}
                {Object.entries(homeData).map(([title, section], index) => {
                    if (title === "Trending Now") return null;
                    const items = section.data || (Array.isArray(section) ? section : []);
                    return renderSection(title, items, index);
                })}
            </div>
        </div>
    );
}
