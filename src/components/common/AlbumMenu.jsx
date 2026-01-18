import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addRangeToQueue, playNext } from '../../store/slices/playerSlice';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../../utils/favoritesUtils';

export default function AlbumMenu({ data, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isFavorited, setIsFavorited] = useState(false);
    const buttonRef = useRef(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Check if album is favorited
    useEffect(() => {
        const checkFavorite = async () => {
            if (user?.id && data?.id) {
                const favorites = await fetchFavorites(user.id);
                const isInFavorites = favorites.albums.some(a => a.id === data.id);
                setIsFavorited(isInFavorites);
            }
        };
        checkFavorite();
    }, [user, data]);

    useEffect(() => {
        if (!isOpen) return;
        function handleClose(event) {
            if (buttonRef.current && buttonRef.current.contains(event.target)) return;
            setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClose);
        window.addEventListener("scroll", handleClose, true);
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
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpwards = spaceBelow < 250;

            setPosition({
                top: openUpwards ? (rect.top - 8) : (rect.bottom + 8),
                left: rect.right,
                openUpwards
            });
            setIsOpen(true);
        }
    };

    const handleAddToQueue = (e) => {
        if (data.list) {
            dispatch(addRangeToQueue(data.list));
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            toast.innerHTML = `<span class="material-icons-round text-primary text-xl">check_circle</span> <span class="text-sm font-bold tracking-wide">Added to Queue</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
        setIsOpen(false);
    };

    const handlePlayNext = (e) => {
        if (data.list) {
            dispatch(playNext(data.list));
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 pointer-events-none backdrop-blur-md';
            toast.innerHTML = `<span class="material-icons-round text-primary text-xl">playlist_play</span> <span class="text-sm font-bold tracking-wide">Playing Next</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('fade-out', 'slide-out-to-bottom-4');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
        setIsOpen(false);
    };

    const handleToggleFavorite = async () => {
        if (!user?.id || !data) return;

        setIsOpen(false);
        const wasFavorited = isFavorited;
        setIsFavorited(!isFavorited);

        try {
            let success;
            if (wasFavorited) {
                success = await removeFromFavorites(user.id, data.id);
            } else {
                success = await addToFavorites(user.id, data, 'album');
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
                setIsFavorited(wasFavorited);
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            setIsFavorited(wasFavorited);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className={`w-16 h-16 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 text-slate-800 dark:text-white flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110 hover:border-primary hover:text-primary active:scale-95 transition-all shadow-lg ${isOpen ? 'border-primary text-primary bg-white/20' : ''}`}
            >
                <span className="material-icons-round text-2xl">more_horiz</span>
            </button>

            {isOpen && createPortal(
                <div
                    className="fixed z-[9999] w-56 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: position.openUpwards ? 'auto' : position.top,
                        bottom: position.openUpwards ? (window.innerHeight - position.top) : 'auto',
                        left: position.left - 224,
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
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">share</span>
                        Share
                    </button>
                </div>,
                document.body
            )}
        </div>
    )
}
