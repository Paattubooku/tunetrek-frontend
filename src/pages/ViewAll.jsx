import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { useAppDispatch, useSelector } from '../store/hooks';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import { decodeHtmlEntities } from '../utils/stringUtils';
import TrackMenu from '../components/common/TrackMenu';

export default function ViewAll() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { title, items } = location.state || {};
    const { currentTrack } = useSelector(state => state.player);

    useEffect(() => {
        if (!items) {
            navigate('/');
        }
    }, [items, navigate]);

    if (!items) return null;

    const isSongList = items.length > 0 && items[0].type === 'song';

    const handlePlaySong = (song, index) => {
        dispatch(setQueue(items));
        dispatch(setCurrentTrack(song));
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const num = parseInt(seconds);
        if (isNaN(num)) return '-';
        const min = Math.floor(num / 60);
        const sec = Math.floor(num % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

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

            {/* List View for Songs */}
            {isSongList ? (
                <div className="flex flex-col gap-1 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 mb-2">
                        <div className="w-12 text-center">#</div>
                        <div>Title</div>
                        <div className="text-right md:w-48 lg:w-64">Album</div>
                        <div className="w-16 text-right">Time</div>
                        <div className="w-8"></div>
                    </div>

                    {items.map((song, index) => {
                        const isPlaying = currentTrack?.id?.toString() === song.id?.toString();
                        return (
                            <div
                                key={song.id}
                                className={`group flex items-center gap-4 p-2 rounded-xl border border-transparent transition-all cursor-pointer ${isPlaying
                                        ? 'bg-primary/10 border-primary/20 dark:bg-primary/20'
                                        : 'hover:bg-white/60 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5'
                                    }`}
                                onClick={() => handlePlaySong(song, index)}
                            >
                                {/* Index (Hidden on Mobile) */}
                                <div className="hidden md:flex relative w-12 h-12 items-center justify-center shrink-0">
                                    {isPlaying ? (
                                        <span className="material-icons-round text-primary animate-pulse">graphic_eq</span>
                                    ) : (
                                        <>
                                            <span className="text-slate-400 font-bold text-sm group-hover:hidden">{index + 1}</span>
                                            <span className="material-icons-round text-slate-800 dark:text-white hidden group-hover:block">play_arrow</span>
                                        </>
                                    )}
                                </div>

                                {/* Image */}
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm md:w-10 md:h-10">
                                    <img src={getHighQualityImage(song.image)} alt={song.title} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold truncate text-sm md:text-base ${isPlaying ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>
                                        {decodeHtmlEntities(song.title)}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate mt-0.5">
                                        <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                            Song
                                        </span>
                                        <span>{decodeHtmlEntities(song.subtitle || song.artist || '')}</span>
                                    </div>
                                </div>

                                {/* Album (Hidden on Mobile) */}
                                <div className="hidden md:block w-48 lg:w-64 text-right text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {decodeHtmlEntities(song.album || '')}
                                </div>

                                {/* Duration (Hidden on Mobile) */}
                                <div className="hidden md:block w-16 text-right text-sm text-slate-500 font-medium font-mono">
                                    {formatDuration(song.duration || song.more_info?.duration)}
                                </div>

                                {/* Menu */}
                                <div onClick={e => e.stopPropagation()}>
                                    <TrackMenu song={song} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Grid View for Albums/Playlists/Artists */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 animate-in fade-in zoom-in-95 duration-500 delay-100 pb-20">
                    {items.map((item, index) => (
                        <Link
                            to={`/${item.type}/${extractIdFromUrl(item.perma_url) || item.id}`}
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
                                <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex justify-end transform translate-y-4 group-hover:translate-y-0">
                                    <button className="bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                                        <span className="material-icons-round text-2xl">play_arrow</span>
                                    </button>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <div className="px-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-[15px] group-hover:text-primary transition-colors">{decodeHtmlEntities(item.title)}</h4>
                                <p className="text-xs text-slate-500 font-medium truncate mt-1 opacity-80">
                                    {decodeHtmlEntities(item.subtitle || item.description || (item.artists && item.artists.map(a => a.name).join(', ')) || item.type || '')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
