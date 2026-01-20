import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToQueue, playNext, setCurrentTrack, setQueue, setStationId } from '../../store/slices/playerSlice';
import { getHighQualityImage, extractIdFromUrl } from '../../utils/imageUtils';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../../utils/favoritesUtils';
import API_URL from '../../config/api.js';

export default function TrackMenu({ song, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isFavorited, setIsFavorited] = useState(false);
    const [checkingFavorite, setCheckingFavorite] = useState(true);
    const buttonRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Check if song is already favorited
    useEffect(() => {
        const checkFavorite = async () => {
            if (user?.id && song?.id) {
                const favorites = await fetchFavorites(user.id);
                const isInFavorites = favorites.songs.some(s => s.id === song.id);
                setIsFavorited(isInFavorites);
                setCheckingFavorite(false);
            }
        };
        checkFavorite();
    }, [user, song]);

    // Handle closing when clicking outside or scrolling
    useEffect(() => {
        if (!isOpen) return;

        function handleClose(event) {
            // If clicking the button itself, let the button handler manage it (prevent toggle loop)
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
                return;
            }
            setIsOpen(false);
        }

        // Close on global click
        document.addEventListener("mousedown", handleClose);
        // Close on scroll (simplest way to handle fixed positioning drifting)
        window.addEventListener("scroll", handleClose, true);
        // Close on resize
        window.addEventListener("resize", handleClose);

        return () => {
            document.removeEventListener("mousedown", handleClose);
            window.removeEventListener("scroll", handleClose, true);
            window.removeEventListener("resize", handleClose);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
        } else {
            // Calculate position
            const rect = buttonRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            // Dimensions
            const MENU_WIDTH = 208; // 13rem (w-52)
            const GAP = 8;
            const PADDING = 16;
            const PLAYER_HEIGHT = 130; // Footer player height (safe for mobile nav + player)

            // Determine Vertical Position
            // Available space below (minus player)
            const spaceBelow = windowHeight - rect.bottom - PLAYER_HEIGHT;
            // Available space above
            const spaceAbove = rect.top;

            let openUpwards = false;
            let maxHeight = 0;

            // Logic: Prefer opening down if there's enough space (e.g. 300px)
            // If not, check if there is more space above.
            if (spaceBelow >= 300) {
                openUpwards = false;
                maxHeight = spaceBelow - PADDING;
            } else if (spaceAbove > spaceBelow) {
                // If constrained below, and more space above, go up.
                openUpwards = true;
                maxHeight = spaceAbove - PADDING;
            } else {
                // If both are tight, go to the larger one
                openUpwards = false;
                maxHeight = spaceBelow - PADDING;
            }

            // Determine Horizontal Position
            // Default: Align Right Edge of menu with Right Edge of button
            let left = rect.right - MENU_WIDTH;

            // If this pushes it off the left edge of the screen
            if (left < PADDING) {
                // Align Left Edge of menu with Left Edge of button instead
                left = rect.left;
            }

            // Failsafe: If it pushes off the right edge (unlikely with default, but good for safety)
            if (left + MENU_WIDTH > windowWidth - PADDING) {
                left = windowWidth - MENU_WIDTH - PADDING;
            }

            setPosition({
                top: openUpwards ? 'auto' : (rect.bottom + GAP),
                bottom: openUpwards ? (windowHeight - rect.top + GAP) : 'auto',
                left: left,
                maxHeight: Math.max(maxHeight, 150), // Ensure at least 150px or it's unusable
                openUpwards // Used for animation origin if needed
            });
            setIsOpen(true);
        }
    };

    const handleAddToQueue = (e) => {
        dispatch(addToQueue(song));
        setIsOpen(false);
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
        toast.innerHTML = `<span class="material-icons-round text-primary text-xl">check_circle</span> <span class="text-sm font-bold tracking-wide">Added to Queue</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out', 'slide-out-to-bottom-4');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    };

    const handlePlayNext = (e) => {
        dispatch(playNext(song));
        setIsOpen(false);
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
        toast.innerHTML = `<span class="material-icons-round text-primary text-xl">playlist_play</span> <span class="text-sm font-bold tracking-wide">Playing Next</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out', 'slide-out-to-bottom-4');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    };

    const handlePlayRadio = async () => {
        setIsOpen(false);
        try {
            // Use pid (id) for creating station
            const id = song.id || extractIdFromUrl(song.perma_url || song.url);

            if (!id) {
                console.error("No song ID found for radio", song);
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
                toast.innerHTML = `<span class="material-icons-round text-red-500 text-xl">error</span> <span class="text-sm font-bold tracking-wide">Unable to start radio</span>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
                return;
            }

            const response = await fetch(`https://mserver-pi.vercel.app/radioNew?query=${id}`);

            console.log("radio response", response);
            if (!response.ok) {
                throw new Error(`Radio API returned ${response.status}`);
            }

            const data = await response.json();

            if (data.songs && data.songs.length > 0) {
                const formattedSongs = data.songs.map(s => ({
                    ...s,
                    id: s.id,
                    title: s.title,
                    image: getHighQualityImage(s.image),
                    subtitle: s.subtitle || s.description || s.artist,
                    type: 'song'
                }));

                dispatch(setCurrentTrack(formattedSongs[0]));
                dispatch(setQueue(formattedSongs));

                if (data.stationId) {
                    dispatch(setStationId(data.stationId));
                }

                const toast = document.createElement('div');
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
                toast.innerHTML = `<span class="material-icons-round text-primary text-xl">radio</span> <span class="text-sm font-bold tracking-wide">Radio Started • ${formattedSongs.length} songs</span>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            } else {
                console.warn("No songs returned from radio API");
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
                toast.innerHTML = `<span class="material-icons-round text-yellow-500 text-xl">warning</span> <span class="text-sm font-bold tracking-wide">No radio songs available</span>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to start radio:", error);
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            toast.innerHTML = `<span class="material-icons-round text-red-500 text-xl">error</span> <span class="text-sm font-bold tracking-wide">Failed to start radio</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user?.id) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            toast.innerHTML = `<span class="material-icons-round text-red-500 text-xl">error</span> <span class="text-sm font-bold tracking-wide">Please log in to save favorites</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
            setIsOpen(false);
            return;
        }

        setIsOpen(false);

        // Optimistic update
        const wasFavorited = isFavorited;
        setIsFavorited(!isFavorited);

        try {
            let success;
            if (wasFavorited) {
                success = await removeFromFavorites(user.id, song.id);
            } else {
                success = await addToFavorites(user.id, song, 'song');
            }

            if (success) {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
                toast.innerHTML = `<span class="material-icons-round text-red-500 text-xl">${wasFavorited ? 'heart_broken' : 'favorite'}</span> <span class="text-sm font-bold tracking-wide">${wasFavorited ? 'Removed from' : 'Added to'} Favorites</span>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            } else {
                // Revert on failure
                setIsFavorited(wasFavorited);
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            setIsFavorited(wasFavorited);
        }
    };

    const handleGoToAlbum = async () => {
        setIsOpen(false);
        // Extract album ID from song's album object or perma_url
        const albumId = extractIdFromUrl(song.more_info.album_url || song.album_url);
        if (albumId) {
            navigate(`/album/${albumId}`);
        }
        else {
            const response = await fetch(`${API_URL}/details/${extractIdFromUrl(song.url)}/song`);
            const data = await response.json();
            navigate(`/album/${extractIdFromUrl(data.more_info.album_url || data.album_url)}`);
        }
    };

    const handleDownload = async () => {
        setIsOpen(false);

        try {
            // Show loading toast
            const loadingToast = document.createElement('div');
            loadingToast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            loadingToast.innerHTML = `<span class="material-icons-round text-primary text-xl animate-spin">refresh</span> <span class="text-sm font-bold tracking-wide">Preparing download...</span>`;
            document.body.appendChild(loadingToast);

            // Get song ID
            const id = song.id || extractIdFromUrl(song.perma_url || song.url);

            if (!id) {
                throw new Error('No song ID found');
            }

            // Fetch encrypted media URL if not available
            let encryptedUrl = song.encrypted_media_url || song.more_info?.encrypted_media_url;

            if (!encryptedUrl) {
                const detailsRes = await fetch(`${API_URL}/details/${id}/song`);
                const detailsData = await detailsRes.json();
                encryptedUrl = detailsData.encrypted_media_url || detailsData.more_info?.encrypted_media_url;
            }

            if (!encryptedUrl) {
                throw new Error('No media URL found');
            }

            // Get media URL
            const mediaRes = await fetch(`${API_URL}/mediaURL/${id}/${encodeURIComponent(encryptedUrl)}`);
            const mediaData = await mediaRes.json();

            let downloadUrl = null;

            if (mediaData.links && Array.isArray(mediaData.links)) {
                // Prioritize 320kbps for best quality
                const quality320 = mediaData.links.find(l => l.quality === '320kbps');
                const quality160 = mediaData.links.find(l => l.quality === '160kbps');
                const quality96 = mediaData.links.find(l => l.quality === '96kbps');

                if (quality320) {
                    downloadUrl = quality320.link;
                } else if (quality160) {
                    downloadUrl = quality160.link;
                } else if (quality96) {
                    downloadUrl = quality96.link;
                } else {
                    downloadUrl = mediaData.links[mediaData.links.length - 1]?.link;
                }
            } else if (mediaData.links) {
                downloadUrl = mediaData.links;
            }

            if (!downloadUrl) {
                throw new Error('No download URL found');
            }

            // Remove loading toast
            loadingToast.remove();

            // Create filename
            const filename = `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;

            // Download the file
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success toast
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            toast.innerHTML = `<span class="material-icons-round text-green-500 text-xl">download_done</span> <span class="text-sm font-bold tracking-wide">Download complete!</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                setTimeout(() => toast.remove(), 300);
            }, 2000);

        } catch (error) {
            console.error('Download failed:', error);
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            toast.innerHTML = `<span class="material-icons-round text-red-500 text-xl">error</span> <span class="text-sm font-bold tracking-wide">Download failed</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
    };


    return (
        <div className={`relative ${className} ${isOpen ? '!opacity-100' : ''}`}>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-800 dark:hover:text-white active:scale-95 ${isOpen ? 'bg-white/20 text-slate-800 dark:text-white' : ''}`}
            >
                <span className="material-icons-round">more_vert</span>
            </button>

            {isOpen && createPortal(
                <div
                    className={`fixed z-[9999] w-52 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col ${position.openUpwards ? 'origin-bottom-right' : 'origin-top-right'}`}
                    style={{
                        top: position.top,
                        bottom: position.bottom,
                        left: position.left,
                        maxHeight: position.maxHeight,
                        overflowY: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handlePlayNext}
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">playlist_play</span>
                        Play Next
                    </button>
                    <button
                        onClick={handlePlayRadio}
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">radio</span>
                        Start Radio
                    </button>
                    <button
                        onClick={handleAddToQueue}
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">queue_music</span>
                        Add to Queue
                    </button>
                    <button
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                        onClick={handleToggleFavorite}
                    >
                        <span className={`material-icons-round text-lg transition-colors ${isFavorited ? 'text-red-500' : 'text-slate-400 group-hover:text-primary'}`}>
                            {isFavorited ? 'favorite' : 'favorite_border'}
                        </span>
                        {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                        onClick={handleDownload}
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">download</span>
                        Download
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-white/10 mx-4 my-1"></div>
                    <button
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">share</span>
                        Share
                    </button>
                    <button
                        className="w-full text-left px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors font-bold relative group"
                        onClick={handleGoToAlbum}
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">album</span>
                        Go to Album
                    </button>
                </div>,
                document.body
            )
            }
        </div >
    )
}
