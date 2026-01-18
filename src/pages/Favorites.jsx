import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { decodeHtmlEntities } from '../utils/stringUtils';
import TrackMenu from '../components/common/TrackMenu';
import { fetchFavorites } from '../utils/favoritesUtils';

export default function Favorites() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentTrack, isPlaying } = useSelector((state) => state.player);
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('songs');
    const [favorites, setFavorites] = useState({
        songs: [],
        albums: [],
        playlists: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user?.id) {
                setLoading(true);
                const data = await fetchFavorites(user.id);
                setFavorites(data);
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handlePlaySong = (song, index) => {
        dispatch(setQueue(favorites.songs));
        dispatch(setCurrentTrack(song));
    };

    const handlePlayAll = () => {
        if (favorites.songs.length > 0) {
            dispatch(setQueue(favorites.songs));
            dispatch(setCurrentTrack(favorites.songs[0]));
        }
    };

    const EmptyState = ({ type }) => (
        <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                    <span className="material-icons-round text-6xl text-slate-400 dark:text-slate-500">favorite_border</span>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary/20 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">No {type} yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                Start building your collection by adding your favorite {type}. Just click the heart icon!
            </p>
            <button
                onClick={() => navigate('/')}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                    <span className="material-icons-round">explore</span>
                    Discover Music
                </span>
            </button>
        </div>
    );

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

    const totalCount = favorites.songs.length + favorites.albums.length + favorites.playlists.length;

    return (
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-32">
            <style>{`
                @keyframes loop-3d-tilt {
                    0%, 100% { transform: perspective(1000px) rotateY(-10deg) rotateX(5deg) scale(1); filter: brightness(1); }
                    50% { transform: perspective(1000px) rotateY(10deg) rotateX(-5deg) scale(1.05); filter: brightness(1.1); }
                }
            `}</style>

            {/* Hero Section - Matching AlbumDetails Style */}
            <div className="relative rounded-[2.5rem] overflow-hidden mb-8">
                {/* Animated Gradient Mesh Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 dark:from-primary/30 dark:via-purple-500/30 dark:to-pink-500/30">
                    {/* Animated Gradient Orbs */}
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
                        {/* Favorites Icon with 3D Tilt Effect */}
                        <div className="shrink-0 group perspective-1000 animate-in zoom-in-95 fade-in duration-700">
                            <div className="relative transform-gpu transition-all duration-500" style={{ animation: 'loop-3d-tilt 8s ease-in-out infinite' }}>
                                {/* Glow Effect */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"></div>

                                {/* Icon Container */}
                                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 backdrop-blur-sm bg-gradient-to-br from-pink-500/80 via-purple-500/80 to-indigo-500/80">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-icons-round text-white drop-shadow-2xl" style={{ fontSize: '12rem' }}>favorite</span>
                                    </div>
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                            </div>
                        </div>

                        {/* Favorites Info */}
                        <div className="flex-1 text-center lg:text-left pb-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                            {/* Type Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mb-6">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                                    Your Collection
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white mb-6 tracking-tighter leading-none drop-shadow-sm">
                                Favorites
                            </h1>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm md:text-base">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">music_note</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{favorites.songs.length} tracks</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">album</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{favorites.albums.length} albums</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">queue_music</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{favorites.playlists.length} playlists</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {activeTab === 'songs' && favorites.songs.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 mb-10 px-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
                    <button
                        onClick={handlePlayAll}
                        className="group relative bg-gradient-to-r from-primary to-purple-500 hover:from-primary-focus hover:to-purple-600 text-white h-16 px-10 rounded-full font-bold text-lg transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="material-icons-round text-3xl relative z-10">play_circle_filled</span>
                        <span className="relative z-10">Play All</span>
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 px-2">
                {['songs', 'albums', 'playlists'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-full text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="px-2">
                {/* Songs Tab */}
                {activeTab === 'songs' && (
                    <div className="space-y-2">
                        {favorites.songs.length > 0 ? (
                            favorites.songs.map((song, index) => {
                                const isCurrent = currentTrack?.id?.toString() === song.id?.toString();
                                const formatDuration = (seconds) => {
                                    if (!seconds) return '-:--';
                                    const min = Math.floor(seconds / 60);
                                    const sec = Math.floor(seconds % 60);
                                    return `${min}:${sec.toString().padStart(2, '0')}`;
                                };

                                return (
                                    <div
                                        key={song.id}
                                        className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${isCurrent
                                            ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 shadow-lg'
                                            : 'hover:bg-white/40 dark:hover:bg-white/5'
                                            }`}
                                        onClick={() => handlePlaySong(song, index)}
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        {/* Animated Background on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                                        {/* Track Number / Play Button */}
                                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0 z-10">
                                            {isCurrent && isPlaying ? (
                                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                                    <span className="material-icons-round text-white animate-pulse">graphic_eq</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className={`text-slate-400 font-bold group-hover:hidden ${isCurrent ? 'hidden' : ''}`}>{index + 1}</span>
                                                    <button className={`hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:scale-110 transition-transform shadow-lg ${isCurrent ? 'flex' : ''}`}>
                                                        <span className="material-icons-round">play_arrow</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Song Image */}
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:shadow-xl transition-shadow z-10">
                                            <img
                                                src={getHighQualityImage(song.image)}
                                                alt={song.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                        </div>

                                        {/* Song Info */}
                                        <div className="flex-1 min-w-0 z-10">
                                            <h4 className={`font-bold truncate transition-colors ${isCurrent
                                                ? 'text-primary'
                                                : 'text-slate-800 dark:text-slate-100 group-hover:text-primary'
                                                }`}>
                                                {decodeHtmlEntities(song.title)}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {decodeHtmlEntities(song.subtitle || song.artist)}
                                            </p>
                                        </div>

                                        {/* Play Count - Hidden on Mobile */}
                                        {song.play_count && (
                                            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400 z-10">
                                                <span className="material-icons-round text-lg">play_circle_outline</span>
                                                {parseInt(song.play_count).toLocaleString()}
                                            </div>
                                        )}

                                        {/* Duration */}
                                        <div className="hidden md:block text-sm text-slate-400 font-medium w-16 text-right z-10">
                                            {formatDuration(parseInt(song.duration || song.more_info?.duration || 0))}
                                        </div>

                                        {/* More Options */}
                                        <TrackMenu song={song} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10" />
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState type="songs" />
                        )}
                    </div>
                )}

                {/* Albums Tab */}
                {activeTab === 'albums' && (
                    <div>
                        {favorites.albums.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {favorites.albums.map(album => {
                                    const albumId = extractIdFromUrl(album.perma_url || album.url) || album.id;
                                    return (
                                        <div
                                            key={album.id}
                                            onClick={() => navigate(`/album/${albumId}`)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
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
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{decodeHtmlEntities(album.title)}</h3>
                                            <p className="text-xs font-medium text-slate-500 truncate">{decodeHtmlEntities(album.subtitle)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState type="albums" />
                        )}
                    </div>
                )}

                {/* Playlists Tab */}
                {activeTab === 'playlists' && (
                    <div>
                        {favorites.playlists.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {favorites.playlists.map(playlist => {
                                    const playlistId = extractIdFromUrl(playlist.perma_url || playlist.url) || playlist.id;
                                    return (
                                        <div
                                            key={playlist.id}
                                            onClick={() => navigate(`/playlist/${playlistId}`)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                                                <img
                                                    src={getHighQualityImage(playlist.image)}
                                                    alt={playlist.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                                        <span className="material-icons-round text-2xl ml-1">play_arrow</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{decodeHtmlEntities(playlist.title)}</h3>
                                            <p className="text-xs font-medium text-slate-500 truncate">{decodeHtmlEntities(playlist.subtitle || 'Playlist')}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState type="playlists" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
