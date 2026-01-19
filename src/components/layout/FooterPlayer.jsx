import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPlaying, togglePlayPause, nextTrack, previousTrack, setVolume, toggleQueue, addRangeToQueue, toggleRepeat, toggleShuffle } from '../../store/slices/playerSlice';
import { extractIdFromUrl, getHighQualityImage } from '../../utils/imageUtils';
import { decodeHtmlEntities } from '../../utils/stringUtils';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../../utils/favoritesUtils';
import { showToast } from '../../utils/toastUtils';
import { addToRecentlyPlayed } from '../../utils/recentlyPlayedUtils';
import TrackMenu from '../common/TrackMenu';
import API_URL from '../../config/api.js';

export default function FooterPlayer() {
    const dispatch = useDispatch();
    const { currentTrack, isPlaying, volume, stationId, queue, shuffle, repeat } = useSelector((state) => state.player);
    const { user } = useSelector((state) => state.auth);
    const audioRef = useRef(null);
    const isFetchingRadio = useRef(false);
    const [audioSrc, setAudioSrc] = useState(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Close expanded player on back button or generic escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsExpanded(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Media Session API for lock screen controls and background playback
    useEffect(() => {
        if (!currentTrack || !('mediaSession' in navigator)) return;

        try {
            // Set metadata for lock screen display
            navigator.mediaSession.metadata = new MediaMetadata({
                title: decodeHtmlEntities(currentTrack.title),
                artist: decodeHtmlEntities(currentTrack.subtitle || currentTrack.artist || 'Unknown Artist'),
                album: decodeHtmlEntities(currentTrack.album || ''),
                artwork: [
                    { src: getHighQualityImage(currentTrack.image), sizes: '96x96', type: 'image/jpeg' },
                    { src: getHighQualityImage(currentTrack.image), sizes: '128x128', type: 'image/jpeg' },
                    { src: getHighQualityImage(currentTrack.image), sizes: '192x192', type: 'image/jpeg' },
                    { src: getHighQualityImage(currentTrack.image), sizes: '256x256', type: 'image/jpeg' },
                    { src: getHighQualityImage(currentTrack.image), sizes: '384x384', type: 'image/jpeg' },
                    { src: getHighQualityImage(currentTrack.image), sizes: '512x512', type: 'image/jpeg' },
                ]
            });

            // Set action handlers for lock screen controls
            navigator.mediaSession.setActionHandler('play', () => {
                dispatch(setPlaying(true));
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                dispatch(setPlaying(false));
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                dispatch(previousTrack());
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                dispatch(nextTrack());
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && audioRef.current) {
                    audioRef.current.currentTime = details.seekTime;
                }
            });

            // Update playback state
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        } catch (error) {
            console.warn('Media Session API error:', error);
        }

        return () => {
            // Clean up handlers
            if ('mediaSession' in navigator) {
                try {
                    navigator.mediaSession.setActionHandler('play', null);
                    navigator.mediaSession.setActionHandler('pause', null);
                    navigator.mediaSession.setActionHandler('previoustrack', null);
                    navigator.mediaSession.setActionHandler('nexttrack', null);
                    navigator.mediaSession.setActionHandler('seekto', null);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, [currentTrack, isPlaying, dispatch]);

    // Update Media Session position state
    useEffect(() => {
        if (!('mediaSession' in navigator) || !audioRef.current) return;

        try {
            if ('setPositionState' in navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: duration || 0,
                    playbackRate: audioRef.current.playbackRate || 1,
                    position: progress || 0
                });
            }
        } catch (error) {
            // Ignore position state errors
        }
    }, [progress, duration]);

    // --- Media URL Fetching ---
    useEffect(() => {
        let isMounted = true;

        const fetchMediaUrl = async () => {
            if (!currentTrack) return;

            // Reset audio source to prevent playing previous track artifacts
            setAudioSrc(null);

            try {
                let src = currentTrack.media_url || null;
                let encryptedUrl = currentTrack.encrypted_media_url || currentTrack.more_info?.encrypted_media_url;

                // If no encrypted URL, try fetching details
                if (!src && !encryptedUrl) {
                    const id = extractIdFromUrl(currentTrack.perma_url || currentTrack.url) || currentTrack.id;
                    if (id) {
                        try {
                            const res = await fetch(`${API_URL}/details/${id}/${currentTrack.type || 'song'}`);
                            const data = await res.json();
                            encryptedUrl = data.encrypted_media_url || data.more_info?.encrypted_media_url;
                        } catch (e) {
                            console.warn("Failed to fetch track details:", e);
                        }
                    }
                }

                // If we have an encrypted URL, resolve it to a stream URL
                if (!src && encryptedUrl) {
                    const id = extractIdFromUrl(currentTrack.perma_url || currentTrack.url) || currentTrack.id;
                    try {
                        const res = await fetch(`${API_URL}/mediaURL/${id}/${encodeURIComponent(encryptedUrl)}`);
                        const data = await res.json();

                        if (data.links) {
                            if (Array.isArray(data.links)) {
                                // Prioritize 320kbps for best quality
                                const quality320 = data.links.find(l => l.quality === '320kbps');
                                const quality160 = data.links.find(l => l.quality === '160kbps');
                                const quality96 = data.links.find(l => l.quality === '96kbps');

                                // Select highest available quality
                                if (quality320) {
                                    src = quality320.link;
                                    console.log('🎵 Playing at 320kbps (High Quality)');
                                } else if (quality160) {
                                    src = quality160.link;
                                    console.log('🎵 Playing at 160kbps (Medium Quality)');
                                } else if (quality96) {
                                    src = quality96.link;
                                    console.log('🎵 Playing at 96kbps (Low Quality)');
                                } else {
                                    // Fallback to last available
                                    src = data.links[data.links.length - 1]?.link;
                                    console.log('🎵 Playing at fallback quality');
                                }
                            } else {
                                src = data.links;
                            }
                        }
                    } catch (e) {
                        console.warn("Media URL resolution failed:", e);
                    }
                }

                if (isMounted) {
                    if (src) {
                        setAudioSrc(src);
                    } else {
                        console.error("No streamable URL found for track");
                    }
                }
            } catch (error) {
                console.error("Critical error loading track:", error);
            }
        };

        fetchMediaUrl();

        // Track recently played
        if (currentTrack && user) {
            try {
                addToRecentlyPlayed(currentTrack, user);
            } catch (err) {
                console.error("Error tracking play:", err);
            }
        }

        return () => { isMounted = false; };
    }, [currentTrack]);

    // --- Infinite Radio Scroll ---
    useEffect(() => {
        if (!stationId || !currentTrack || !queue.length) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);

        if (currentIndex !== -1 && queue.length - currentIndex <= 3) {
            if (isFetchingRadio.current) return;

            isFetchingRadio.current = true;

            fetch(`https://mserver-pi.vercel.app/moreRadioNew/${stationId}/20`)
                .then(res => res.json())
                .then(newSongs => {
                    if (Array.isArray(newSongs) && newSongs.length > 0) {
                        const formatted = newSongs.map(s => ({
                            ...s,
                            id: s.id,
                            title: s.title,
                            image: getHighQualityImage(s.image),
                            subtitle: s.subtitle || s.description || s.artist || '',
                            type: 'song'
                        }));
                        dispatch(addRangeToQueue(formatted));
                    }
                })
                .catch(e => console.error("Radio fetch error:", e))
                .finally(() => { isFetchingRadio.current = false; });
        }
    }, [currentTrack, stationId, queue.length, dispatch]);

    // --- Audio Control Sync ---
    useEffect(() => {
        if (!audioRef.current || !audioSrc) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => {
                console.error("Play error:", e);
                // Setup retry or auto-pause on failure?
                if (e.name !== 'AbortError') dispatch(setPlaying(false));
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, audioSrc, dispatch]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // --- Handlers ---
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            if (isPlaying) audioRef.current.play().catch(e => console.error(e));
        }
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const handleEnded = () => {
        if (repeat === 'one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error(e));
            }
        } else {
            dispatch(nextTrack());
        }
    };

    // Check if current track is favorited
    useEffect(() => {
        const checkFavorite = async () => {
            if (user?.id && currentTrack?.id) {
                const favorites = await fetchFavorites(user.id);
                const isInFavorites = favorites.songs.some(s => s.id === currentTrack.id);
                setIsFavorited(isInFavorites);
            } else {
                setIsFavorited(false);
            }
        };
        checkFavorite();
    }, [user, currentTrack]);

    const handleToggleFavorite = async () => {
        if (!user?.id || !currentTrack) {
            showToast('Please log in to save favorites', 'error');
            return;
        }

        const wasFavorited = isFavorited;
        setIsFavorited(!isFavorited);

        try {
            let success;
            if (wasFavorited) {
                success = await removeFromFavorites(user.id, currentTrack.id);
                if (success) showToast('Removed from Favorites', 'unfavorite');
            } else {
                success = await addToFavorites(user.id, currentTrack, 'song');
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

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    return (
        <>
            {/* --- MOBILE FULL SCREEN PLAYER --- */}
            <div className={`md:hidden fixed inset-0 z-[60] bg-white dark:bg-[#121212] flex flex-col transition-all duration-300 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                {/* Header (Back Button) */}
                <div className="flex items-center justify-between px-6 py-6">
                    <button onClick={() => setIsExpanded(false)} className="p-2 -ml-2 text-slate-900 dark:text-white">
                        <span className="material-icons-round text-3xl">keyboard_arrow_down</span>
                    </button>
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Now Playing</span>
                    <div className="flex items-center gap-2">
                        <button onClick={handleToggleFavorite} className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all ${isFavorited ? 'text-red-500' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                            <span className="material-icons-round text-2xl">{isFavorited ? 'favorite' : 'favorite_border'}</span>
                        </button>
                        <div onClick={(e) => e.stopPropagation()}>
                            <TrackMenu song={currentTrack} className="!opacity-100" />
                        </div>
                    </div>
                </div>

                {/* Main Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto w-full px-6 pb-6 flex flex-col items-center justify-start gap-6 no-scrollbar">
                    {/* Artwork */}
                    <div className="w-full max-w-[320px] aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 relative shrink-0 mt-4">
                        {currentTrack.image && (
                            <img
                                src={getHighQualityImage(currentTrack.image)}
                                alt={decodeHtmlEntities(currentTrack.title)}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center w-full">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                            {decodeHtmlEntities(currentTrack.title)}
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            {decodeHtmlEntities(currentTrack.subtitle || currentTrack.artist || 'Unknown Artist')}
                        </p>
                    </div>

                    {/* Seek Bar */}
                    <div className="w-full space-y-2">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={progress}
                            onChange={(e) => {
                                const time = Number(e.target.value);
                                setProgress(time);
                                if (audioRef.current) audioRef.current.currentTime = time;
                            }}
                            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary-focus transition-all"
                        />
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>{formatTime(progress)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between w-full max-w-sm mt-4">
                        <button
                            onClick={() => dispatch(toggleShuffle())}
                            disabled={!!stationId}
                            className={`p-2 transition-colors ${stationId ? 'text-slate-300 dark:text-slate-700' : (shuffle ? 'text-primary' : 'text-slate-400')}`}
                        >
                            <span className="material-icons-round text-2xl">shuffle</span>
                        </button>

                        <button onClick={() => dispatch(previousTrack())} className="p-2 text-slate-900 dark:text-white active:scale-95">
                            <span className="material-icons-round text-4xl">skip_previous</span>
                        </button>

                        <button
                            onClick={() => dispatch(togglePlayPause())}
                            className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                        >
                            <span className="material-icons-round text-5xl ml-1">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>

                        <button onClick={() => dispatch(nextTrack())} className="p-2 text-slate-900 dark:text-white active:scale-95">
                            <span className="material-icons-round text-4xl">skip_next</span>
                        </button>

                        <button
                            onClick={() => dispatch(toggleRepeat())}
                            className={`p-2 transition-colors relative ${repeat !== 'off' ? 'text-primary' : 'text-slate-400'}`}
                        >
                            <span className="material-icons-round text-2xl">
                                {repeat === 'one' ? 'repeat_one' : 'repeat'}
                            </span>
                            {repeat !== 'off' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>}
                        </button>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-8 pb-10 flex justify-center">
                    <button
                        onClick={() => { setIsExpanded(false); dispatch(toggleQueue()); }}
                        className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-wider uppercase hover:text-primary transition-colors"
                    >
                        <span className="material-icons-round">queue_music</span>
                        <span>Up Next</span>
                    </button>
                </div>
            </div>


            {/* --- DESKTOP / MINI PLAYER --- */}
            <div
                className="fixed bottom-[60px] md:bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 md:h-24 transition-all duration-300 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]"
                onClick={(e) => {
                    // Expand on mobile if not clicking a button
                    if (window.innerWidth < 768 && !e.target.closest('button') && !e.target.closest('input')) {
                        setIsExpanded(true);
                    }
                }}
            >
                {/* Mobile Progress Bar (Top Edge) */}
                <div
                    className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800"
                >
                    <div
                        className="h-full bg-primary origin-left"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    ></div>
                </div>

                <audio
                    ref={audioRef}
                    src={audioSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                />

                <div className="flex items-center justify-between px-4 md:px-6 h-16 md:h-full">
                    {/* Track Info */}
                    <div className="flex items-center gap-3 md:gap-4 w-[65%] md:w-[30%] min-w-0">
                        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded md:rounded-lg overflow-hidden shadow-md group shrink-0">
                            {currentTrack.image && (
                                <img
                                    src={getHighQualityImage(currentTrack.image)}
                                    alt={decodeHtmlEntities(currentTrack.title)}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base leading-tight md:leading-normal">
                                {decodeHtmlEntities(currentTrack.title)}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                                {decodeHtmlEntities(currentTrack.subtitle || currentTrack.artist || currentTrack.more_info?.music)}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all ${isFavorited ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                            >
                                <span className="material-icons-round text-xl">
                                    {isFavorited ? 'favorite' : 'favorite_border'}
                                </span>
                            </button>
                            <div onClick={(e) => e.stopPropagation()}>
                                <TrackMenu song={currentTrack} className="!opacity-100" />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Mini Controls (Right Side) */}
                    <div className="flex md:hidden items-center gap-4 pr-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); dispatch(togglePlayPause()); }}
                            className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center active:scale-95 transition-transform shadow-lg"
                        >
                            <span className="material-icons-round text-2xl ml-0.5">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(nextTrack()); }} className="text-slate-800 dark:text-white active:scale-95">
                            <span className="material-icons-round text-3xl">skip_next</span>
                        </button>
                    </div>

                    {/* Desktop Playback Controls & Progress */}
                    <div className="hidden md:flex flex-col items-center gap-2 w-[40%] max-w-2xl">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => dispatch(toggleShuffle())}
                                disabled={!!stationId}
                                className={`transition-colors ${stationId ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : (shuffle ? 'text-primary' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white')}`}
                            >
                                <span className="material-icons-round text-xl">shuffle</span>
                            </button>
                            <button onClick={() => dispatch(previousTrack())} className="text-slate-800 dark:text-white hover:scale-110 transition-transform">
                                <span className="material-icons-round text-3xl">skip_previous</span>
                            </button>
                            <button
                                onClick={() => dispatch(togglePlayPause())}
                                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-primary/30 transition-all"
                            >
                                <span className="material-icons-round text-2xl relative left-[1px]">
                                    {isPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </button>
                            <button onClick={() => dispatch(nextTrack())} className="text-slate-800 dark:text-white hover:scale-110 transition-transform">
                                <span className="material-icons-round text-3xl">skip_next</span>
                            </button>
                            <button
                                onClick={() => dispatch(toggleRepeat())}
                                className={`transition-colors ${repeat !== 'off' ? 'text-primary' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                            >
                                <span className="material-icons-round text-xl">
                                    {repeat === 'one' ? 'repeat_one' : 'repeat'}
                                </span>
                            </button>
                        </div>

                        <div className="w-full flex items-center gap-3 text-xs font-semibold text-slate-400 select-none">
                            <span className="w-10 text-right tabular-nums">{formatTime(progress)}</span>
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full relative group cursor-pointer">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={progress}
                                    onChange={handleSeek}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="h-full bg-primary rounded-full relative transition-all duration-100"
                                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform scale-150"></div>
                                </div>
                            </div>
                            <span className="w-10 tabular-nums">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Desktop Volume & Extras */}
                    <div className="hidden md:flex items-center justify-end gap-4 w-[30%]">
                        <div className="flex items-center gap-2 group">
                            <button
                                onClick={() => dispatch(setVolume(volume === 0 ? 1 : 0))}
                                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                <span className="material-icons-round">{volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}</span>
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
                                className="w-20 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80"
                            />
                        </div>
                        <button
                            onClick={() => dispatch(toggleQueue())}
                            className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            <span className="material-icons-round">queue_music</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
