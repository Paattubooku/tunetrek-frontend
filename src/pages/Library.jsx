import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { decodeHtmlEntities } from '../utils/stringUtils';
import { fetchFavorites } from '../utils/favoritesUtils';
import { getRecentlyPlayed } from '../utils/recentlyPlayedUtils';

export default function Library() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [favorites, setFavorites] = useState({
        songs: [],
        albums: [],
        playlists: []
    });
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user?.id) {
                setLoading(true);

                // Load favorites
                const favData = await fetchFavorites(user.id);
                setFavorites(favData);

                // Load recently played from API
                const recent = await getRecentlyPlayed(user.id);
                setRecentlyPlayed(recent);

                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    const totalFavorites = favorites.songs.length + favorites.albums.length + favorites.playlists.length;

    return (
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-32">
            <style>{`
                @keyframes loop-3d-tilt {
                    0%, 100% { transform: perspective(1000px) rotateY(-10deg) rotateX(5deg) scale(1); filter: brightness(1); }
                    50% { transform: perspective(1000px) rotateY(10deg) rotateX(-5deg) scale(1.05); filter: brightness(1.1); }
                }
            `}</style>

            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden mb-8">
                {/* Animated Gradient Mesh Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 dark:from-primary/30 dark:via-purple-500/30 dark:to-pink-500/30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Floating Geometric Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-20 h-20 border-2 border-white/10 rounded-lg rotate-12 animate-float"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 border-2 border-white/10 rounded-full animate-float animation-delay-1000"></div>
                    <div className="absolute bottom-32 left-1/4 w-12 h-12 border-2 border-white/10 rotate-45 animate-float animation-delay-2000"></div>
                    <div className="absolute bottom-20 right-1/3 w-24 h-24 border-2 border-white/10 rounded-lg -rotate-12 animate-float animation-delay-3000"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 px-8 md:px-12 py-12 md:py-16">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-end">
                        {/* Library Icon with 3D Tilt Effect */}
                        <div className="shrink-0 group perspective-1000 animate-in zoom-in-95 fade-in duration-700">
                            <div className="relative transform-gpu transition-all duration-500" style={{ animation: 'loop-3d-tilt 8s ease-in-out infinite' }}>
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"></div>
                                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 backdrop-blur-sm bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-pink-500/80">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-icons-round text-white drop-shadow-2xl" style={{ fontSize: '12rem' }}>library_music</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                            </div>
                        </div>

                        {/* Library Info */}
                        <div className="flex-1 text-center lg:text-left pb-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mb-6">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                                    Your Music
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white mb-6 tracking-tighter leading-none drop-shadow-sm">
                                Library
                            </h1>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm md:text-base">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">favorite</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{totalFavorites} favorites</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">history</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{recentlyPlayed.length} recent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favorites Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                        Favorites
                    </h2>
                    <button
                        onClick={() => navigate('/favorites')}
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        See All
                        <span className="material-icons-round text-lg">arrow_forward</span>
                    </button>
                </div>

                {totalFavorites > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-2">
                        {/* Favorite Songs */}
                        {favorites.songs.slice(0, 6).map(song => (
                            <div
                                key={song.id}
                                onClick={() => {
                                    dispatch(setQueue([song]));
                                    dispatch(setCurrentTrack(song));
                                }}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                                    <img
                                        src={getHighQualityImage(song.image)}
                                        alt={song.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                            <span className="material-icons-round text-2xl ml-1">play_arrow</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className="material-icons-round text-red-500 text-xl drop-shadow-lg">favorite</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{decodeHtmlEntities(song.title)}</h3>
                                <p className="text-xs text-slate-500 truncate">Song</p>
                            </div>
                        ))}

                        {/* Favorite Albums */}
                        {favorites.albums.slice(0, 6).map(album => {
                            const albumId = extractIdFromUrl(album.perma_url || album.url) || album.id;
                            return (
                                <div
                                    key={album.id}
                                    onClick={() => navigate(`/album/${albumId}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                                        <img
                                            src={getHighQualityImage(album.image)}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                                <span className="material-icons-round text-2xl ml-1">play_arrow</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="material-icons-round text-red-500 text-xl drop-shadow-lg">favorite</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{decodeHtmlEntities(album.title)}</h3>
                                    <p className="text-xs text-slate-500 truncate">Album</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-round text-4xl text-slate-400">favorite_border</span>
                        </div>
                        <p className="text-slate-500 mb-4">No favorites yet</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-focus transition-colors"
                        >
                            Discover Music
                        </button>
                    </div>
                )}
            </div>

            {/* Recently Played Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                        Recently Played
                    </h2>
                </div>

                {recentlyPlayed.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-2">
                        {recentlyPlayed.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                onClick={() => {
                                    if (item.type === 'song') {
                                        dispatch(setQueue([item]));
                                        dispatch(setCurrentTrack(item));
                                    } else if (item.type === 'album') {
                                        const albumId = extractIdFromUrl(item.perma_url || item.url) || item.id;
                                        navigate(`/album/${albumId}`);
                                    } else if (item.type === 'playlist') {
                                        const playlistId = extractIdFromUrl(item.perma_url || item.url) || item.id;
                                        navigate(`/playlist/${playlistId}`);
                                    }
                                }}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                                    <img
                                        src={getHighQualityImage(item.image)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                            <span className="material-icons-round text-2xl ml-1">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{decodeHtmlEntities(item.title)}</h3>
                                <p className="text-xs text-slate-500 truncate capitalize">{item.type || 'Song'}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-round text-4xl text-slate-400">history</span>
                        </div>
                        <p className="text-slate-500 mb-4">No recently played items</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-focus transition-colors"
                        >
                            Start Listening
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
