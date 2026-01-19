import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { decodeHtmlEntities } from '../utils/stringUtils';
import { useAppDispatch } from '../store/hooks';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import TrackMenu from '../components/common/TrackMenu';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../utils/favoritesUtils';
import { showToast } from '../utils/toastUtils';
import API_URL from '../config/api.js';

export default function PlaylistDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [playlistData, setPlaylistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentTrack } = useSelector((state) => state.player);
    const { user } = useSelector((state) => state.auth);
    const [modulesData, setModulesData] = useState([]);
    const [isFavorited, setIsFavorited] = useState(false);
    const containerRef = useRef(null);

    // Scroll to top when ID changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, [id]);

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/details/${id}/playlist`);
                const data = await response.json();
                setPlaylistData(data);

                // Extract modules data and fetch actual content
                if (data.modules) {
                    const moduleKeys = Object.keys(data.modules).filter(key => key !== 'list');

                    // Fetch data for each module
                    const modulesWithData = await Promise.all(
                        moduleKeys.map(async (key) => {
                            const module = data.modules[key];

                            try {
                                // Call otherDetails API with source and source_params
                                const params = new URLSearchParams(module.source_params).toString();

                                const moduleResponse = await fetch(`${API_URL}/otherDetails/${encodeURIComponent(module.title)}/${module.source}/${params || '_'}`);
                                const moduleData = await moduleResponse.json();

                                // The response is wrapped in an object with the title as key
                                // Extract the actual data array
                                const actualData = moduleData[module.title] || moduleData;

                                return {
                                    key,
                                    title: module.title || key,
                                    source: module.source,
                                    source_params: module.source_params,
                                    data: actualData, // Actual fetched data
                                    ...module
                                };
                            } catch (error) {
                                console.error(`Error fetching module ${key}:`, error);
                                return {
                                    key,
                                    title: module.title || key,
                                    source: module.source,
                                    source_params: module.source_params,
                                    data: null,
                                    error: true,
                                    ...module
                                };
                            }
                        })
                    );

                    // Filter out modules with errors or no data
                    const validModules = modulesWithData.filter(module =>
                        !module.error &&
                        module.data &&
                        Array.isArray(module.data) &&
                        module.data.length > 0
                    );

                    setModulesData(validModules);
                }
            } catch (error) {
                console.error("Error fetching playlist details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlaylistDetails();
        }
    }, [id]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTotalDuration = () => {
        if (!playlistData?.list) return '0:00';
        const total = playlistData.list.reduce((acc, song) => {
            return acc + parseInt(song.more_info?.duration || 0);
        }, 0);
        return formatDuration(total);
    };

    const handlePlayAll = () => {
        if (playlistData?.list && playlistData.list.length > 0) {
            dispatch(setQueue(playlistData.list));
            dispatch(setCurrentTrack(playlistData.list[0]));
        }
    };

    const handlePlaySong = (song, index) => {
        dispatch(setQueue(playlistData.list));
        dispatch(setCurrentTrack(song));
    };

    // Check if playlist is favorited
    useEffect(() => {
        const checkFavorite = async () => {
            if (user?.id && playlistData?.id) {
                const favorites = await fetchFavorites(user.id);
                const isInFavorites = favorites.playlists.some(p => p.id === playlistData.id);
                setIsFavorited(isInFavorites);
            }
        };
        checkFavorite();
    }, [user, playlistData]);

    const handleToggleFavorite = async () => {
        if (!user?.id || !playlistData) {
            showToast('Please log in to save favorites', 'error');
            return;
        }

        const wasFavorited = isFavorited;
        setIsFavorited(!isFavorited);

        try {
            let success;
            if (wasFavorited) {
                success = await removeFromFavorites(user.id, playlistData.id);
                if (success) showToast('Removed from Favorites', 'unfavorite');
            } else {
                success = await addToFavorites(user.id, playlistData, 'playlist');
                if (success) showToast('Added to Favorites', 'favorite');
            }

            if (!success) {
                setIsFavorited(wasFavorited);
                showToast('Failed to update favorites', 'error');
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            setIsFavorited(wasFavorited);
            showToast('An error occurred', 'error');
        }
    };

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

    if (!playlistData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                <span className="material-icons-round text-6xl opacity-20">queue_music</span>
                <p>Playlist not found</p>
                <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-32">
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
                    <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                    }}></div>
                </div>

                {/* Floating Geometric Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-20 h-20 border-2 border-white/10 rounded-lg rotate-12 animate-float"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 border-2 border-white/10 rounded-full animate-float animation-delay-1000"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 px-8 md:px-12 py-12 md:py-16">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-end">
                        {/* Playlist Cover */}
                        <div className="shrink-0 group perspective-1000 animate-in zoom-in-95 fade-in duration-700">
                            <div className="relative transform-gpu transition-all duration-500" style={{ animation: 'loop-3d-tilt 8s ease-in-out infinite' }}>
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"></div>
                                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 backdrop-blur-sm bg-white/10">
                                    <img
                                        src={getHighQualityImage(playlistData.image)}
                                        alt={playlistData.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                            </div>
                        </div>

                        {/* Playlist Info */}
                        <div className="flex-1 text-center lg:text-left pb-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mb-6">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                                    Playlist
                                </span>
                            </div>

                            <h1 className={`${playlistData.title.length > 40
                                ? "text-3xl md:text-5xl lg:text-6xl"
                                : playlistData.title.length > 20
                                    ? "text-4xl md:text-6xl lg:text-7xl"
                                    : "text-5xl md:text-7xl lg:text-8xl"
                                } font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white mb-6 tracking-tighter leading-none drop-shadow-sm line-clamp-2`}>
                                {decodeHtmlEntities(playlistData.title)}
                            </h1>

                            <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 mb-8 drop-shadow-sm line-clamp-3">
                                {decodeHtmlEntities(playlistData.subtitle || playlistData.description || playlistData.header_desc)}
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm md:text-base">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">music_note</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{playlistData.list_count || 0} tracks</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">schedule</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{getTotalDuration()}</span>
                                </div>
                                {playlistData.more_info?.language && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                        <span className="material-icons-round text-lg text-primary">language</span>
                                        <span className="font-semibold text-slate-800 dark:text-white capitalize">{playlistData.more_info.language}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 px-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
                <button
                    onClick={handlePlayAll}
                    className="group relative bg-gradient-to-r from-primary to-purple-500 hover:from-primary-focus hover:to-purple-600 text-white h-16 px-10 rounded-full font-bold text-lg transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="material-icons-round text-3xl relative z-10">play_circle_filled</span>
                    <span className="relative z-10">Play All</span>
                </button>
                <button
                    onClick={handleToggleFavorite}
                    className={`w-16 h-16 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-lg ${isFavorited ? 'border-red-500 text-red-500' : 'border-white/10 text-slate-800 dark:text-white hover:border-primary hover:text-primary'}`}
                >
                    <span className="material-icons-round text-2xl">
                        {isFavorited ? 'favorite' : 'favorite_border'}
                    </span>
                </button>
                <button className="w-16 h-16 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 text-slate-800 dark:text-white flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110 hover:border-primary hover:text-primary active:scale-95 transition-all shadow-lg">
                    <span className="material-icons-round text-2xl">share</span>
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Left Column - Track List */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <span className="w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-full"></span>
                            Tracks
                        </h2>
                    </div>

                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                        {playlistData.list?.map((song, index) => (
                            <div
                                key={song.id}
                                className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${currentTrack?.id?.toString() === song.id?.toString()
                                    ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 shadow-lg'
                                    : 'hover:bg-white/40 dark:hover:bg-white/5'
                                    }`}
                                onClick={() => handlePlaySong(song, index)}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                                <div className="hidden md:flex relative w-12 h-12 items-center justify-center shrink-0 z-10">
                                    {currentTrack?.id?.toString() === song.id?.toString() ? (
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                            <span className="material-icons-round text-white animate-pulse">graphic_eq</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-slate-400 font-bold group-hover:hidden">{index + 1}</span>
                                            <button className="hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:scale-110 transition-transform shadow-lg">
                                                <span className="material-icons-round">play_arrow</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:shadow-xl transition-shadow z-10">
                                    <img
                                        src={getHighQualityImage(song.image)}
                                        alt={song.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                </div>

                                <div className="flex-1 min-w-0 z-10">
                                    <h4 className={`font-bold truncate transition-colors ${currentTrack?.id?.toString() === song.id?.toString()
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
                                <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400 z-10">
                                    <span className="material-icons-round text-lg">play_circle_outline</span>
                                    {parseInt(song.play_count || 0).toLocaleString()}
                                </div>

                                <div className="hidden md:block text-sm text-slate-400 font-medium w-16 text-right z-10">
                                    {formatDuration(parseInt(song.more_info?.duration || 0))}
                                </div>

                                {/* More Options */}
                                <TrackMenu song={song} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Playlist Info & Artists */}
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-700 delay-300">
                    {/* Info Card - Solid & Clean */}
                    <div className="bg-white dark:bg-[#0b1526] p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
                            <span className="material-icons-round text-9xl text-primary transform rotate-12">queue_music</span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 relative z-10 flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full"></span>
                            About Playlist
                        </h3>

                        <div className="space-y-1 relative z-10">
                            {playlistData.more_info?.uid && (
                                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Curator</span>
                                    <span className="text-slate-900 dark:text-white font-semibold text-sm block truncate max-w-[120px]">
                                        {playlistData.more_info.firstname} {playlistData.more_info.lastname}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/5">
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Followers</span>
                                <span className="text-slate-900 dark:text-white font-semibold text-sm">{playlistData.more_info?.follower_count || '0'}</span>
                            </div>
                            {playlistData.more_info?.last_updated && (
                                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Updated</span>
                                    <span className="text-slate-900 dark:text-white font-semibold text-sm">
                                        {new Date(parseInt(playlistData.more_info.last_updated) * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Section */}
            {modulesData && modulesData.length > 0 && (
                <div className="space-y-12 mt-16">
                    {modulesData.map((module, moduleIndex) => (
                        <div key={module.key} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${800 + moduleIndex * 100}ms` }}>
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <span className="w-1 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full"></span>
                                    {module.title}
                                </h2>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory -mx-2 px-6">
                                {module.data.map((item, itemIndex) => (
                                    <Link
                                        key={item.id || itemIndex}
                                        to={`/${item.type}/${extractIdFromUrl(item.perma_url) || item.id}`}
                                        className="snap-center shrink-0 w-48 group cursor-pointer flex flex-col gap-4 relative"
                                    >
                                        <div className="aspect-square rounded-3xl overflow-hidden relative shadow-lg group-hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.3)] transition-all duration-500">
                                            <img
                                                src={getHighQualityImage(item.image)}
                                                alt={item.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-xl scale-50 group-hover:scale-100 transition-all duration-500 hover:bg-primary hover:border-primary">
                                                    <span className="material-icons-round text-3xl ml-1">play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-1 relative group-hover:-translate-y-1 transition-transform duration-300">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-base group-hover:text-primary transition-colors">{decodeHtmlEntities(item.title)}</h4>
                                            <p className="text-xs text-slate-500 font-medium truncate mt-1">{decodeHtmlEntities(item.subtitle)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
