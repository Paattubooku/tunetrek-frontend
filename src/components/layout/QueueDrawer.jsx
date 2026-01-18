import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleQueue, setCurrentTrack, removeFromQueue, setQueue, reorderQueue } from '../../store/slices/playerSlice';
import { getHighQualityImage } from '../../utils/imageUtils';
import { decodeHtmlEntities } from '../../utils/stringUtils';

export default function QueueDrawer() {
    const dispatch = useDispatch();
    const { queue, currentTrack, showQueue } = useSelector((state) => state.player);
    const scrollRef = useRef(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const dragGhost = useRef(null);

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or simple styling
        e.target.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleDragEnter = (e, position) => {
        e.preventDefault();
        dragOverItem.current = position;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const fromIndex = dragItem.current;
        const toIndex = dragOverItem.current;
        if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
            dispatch(reorderQueue({ fromIndex, toIndex }));
        }
    };

    // -- TOUCH SUPPORT --
    const handleTouchStart = (e, index) => {
        dragItem.current = index;
        const item = e.target.closest('[data-queue-index]');

        if (item) {
            item.classList.add('opacity-50', 'bg-slate-100', 'dark:bg-white/10');

            // Create Visual Ghost
            const ghost = item.cloneNode(true);
            const rect = item.getBoundingClientRect();

            ghost.style.position = 'fixed';
            ghost.style.top = `${rect.top}px`;
            ghost.style.left = `${rect.left}px`;
            ghost.style.width = `${rect.width}px`;
            ghost.style.height = `${rect.height}px`;
            ghost.style.zIndex = '9999';
            ghost.style.opacity = '0.9';
            ghost.style.pointerEvents = 'none'; // Crucial so elementFromPoint works underneath
            ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            ghost.style.transform = 'scale(1.05)';
            ghost.style.transition = 'none'; // No lag
            // Ensure background is solid (checking dark mode roughly or defaulting)
            ghost.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#1e1e1e' : '#ffffff';
            ghost.classList.add('rounded-xl', 'border', 'border-primary'); // Add border for visibility

            document.body.appendChild(ghost);
            dragGhost.current = ghost;

            // Offset logic for smooth dragging (holding point vs top-left)
            const touch = e.touches[0];
            dragGhost.current.dataset.offsetX = touch.clientX - rect.left;
            dragGhost.current.dataset.offsetY = touch.clientY - rect.top;
        }
    };

    const handleTouchMove = (e) => {
        if (dragItem.current !== null && dragGhost.current) {
            e.preventDefault(); // Prevent scrolling while dragging handle
            const touch = e.touches[0];
            const offsetX = parseFloat(dragGhost.current.dataset.offsetX || 0);
            const offsetY = parseFloat(dragGhost.current.dataset.offsetY || 0);

            dragGhost.current.style.left = `${touch.clientX - offsetX}px`;
            dragGhost.current.style.top = `${touch.clientY - offsetY}px`;
        }
    };

    const handleTouchEnd = (e) => {
        // Cleanup Ghost
        if (dragGhost.current) {
            document.body.removeChild(dragGhost.current);
            dragGhost.current = null;
        }

        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const row = target?.closest('[data-queue-index]');

        // Remove visuals from all items
        document.querySelectorAll('[data-queue-index]').forEach(el =>
            el.classList.remove('opacity-50', 'bg-slate-100', 'dark:bg-white/10')
        );

        if (row) {
            const toIndex = parseInt(row.getAttribute('data-queue-index'));
            const fromIndex = dragItem.current;

            if (fromIndex !== null && !isNaN(toIndex) && fromIndex !== toIndex) {
                dispatch(reorderQueue({ fromIndex, toIndex }));
            }
        }
        dragItem.current = null;
    };

    // Find current index
    const currentIndex = queue.findIndex(t => t.id?.toString() === currentTrack?.id?.toString());

    // Scroll current active track into view on mount/update
    useEffect(() => {
        if (showQueue && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showQueue, currentTrack]);

    const upNext = currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue;

    return (
        <>
            {/* Mobile Backdrop - Only visible on mobile when open */}
            <div
                className={`xl:hidden fixed inset-0 bg-black/40 backdrop-blur-md z-[90] transition-opacity duration-300 ${showQueue ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => dispatch(toggleQueue())}
            ></div>

            {/* Panel Container */}
            {/* Panel Container */}
            <div className={`
                fixed z-[100] md:z-40 xl:z-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                
                inset-x-0 bottom-0 h-[85vh] rounded-t-[2.5rem] 
                bg-white dark:bg-[#121212] border-t border-slate-200 dark:border-white/10
                shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.3)]
                ${showQueue ? 'translate-y-0' : 'translate-y-full'}

                md:inset-y-0 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-96 md:h-full md:rounded-none
                md:border-l md:border-t-0 md:border-white/10
                md:bg-white/90 md:dark:bg-[#0a0a0a]/95 md:backdrop-blur-3xl
                ${showQueue ? 'md:translate-x-0 md:translate-y-0' : 'md:translate-x-full md:translate-y-0'}

                xl:static xl:inset-auto xl:h-full xl:rounded-none xl:bg-transparent xl:border-none xl:shadow-none xl:transform-none xl:backdrop-blur-none
                
                ${showQueue ? 'xl:w-80 xl:ml-6 xl:opacity-100' : 'xl:w-0 xl:ml-0 xl:opacity-0 overflow-hidden'}
            `}>
                {/* Mobile Drag Handle */}
                <div className="md:hidden w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => dispatch(toggleQueue())}>
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"></div>
                </div>
                {/* Desktop Glass Panel Wrapper (Inner) */}
                <div className="h-full w-full xl:glass-panel xl:rounded-2xl xl:border xl:border-white/10 flex flex-col overflow-hidden relative">
                    {/* Decorative Gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                    {/* Header */}
                    <div className="p-8 pb-4 shrink-0 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Queue</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">{queue.length} Tracks</p>
                        </div>
                        <div className="flex gap-2">
                            {queue.length > 0 && (
                                <button
                                    onClick={() => dispatch(setQueue([]))}
                                    className="p-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-wider"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={() => dispatch(toggleQueue())}
                                className="p-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl transition-all group"
                            >
                                <span className="material-icons-round text-slate-800 dark:text-white group-hover:rotate-90 transition-transform">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar">
                        {/* Empty State */}
                        {queue.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6 animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-2">
                                    <span className="material-icons-round text-6xl opacity-50">queue_music</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-slate-700 dark:text-white">Your queue is empty</p>
                                    <p className="text-sm mt-2">Add songs to keep the music playing</p>
                                </div>
                            </div>
                        )}

                        {/* Now Playing Section */}
                        {currentTrack && (
                            <div className="mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    Now Playing
                                </h3>
                                <div className="relative group perspective-1000">
                                    <div className="relative overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] group-hover:rotate-y-2">
                                        {/* Background Blur */}
                                        <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110" style={{ backgroundImage: `url(${getHighQualityImage(currentTrack.image)})` }}></div>

                                        <div className="relative bg-black/40 backdrop-blur-sm p-6 flex flex-col gap-6">
                                            <div className="flex gap-6 items-center">
                                                <img
                                                    src={getHighQualityImage(currentTrack.image)}
                                                    alt={currentTrack.title}
                                                    className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-2 ring-white/20"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg md:text-xl font-bold text-white leading-tight line-clamp-2 mb-1" title={currentTrack.title}>{decodeHtmlEntities(currentTrack.title)}</h4>
                                                    <p className="text-xs md:text-sm text-white/80 font-medium truncate">{decodeHtmlEntities(currentTrack.artist)}</p>
                                                    <div className="mt-3 flex gap-2">
                                                        <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
                                                            {currentTrack.more_info?.quality || 'HQ'}
                                                        </span>
                                                        <span className="px-3 py-1 bg-primary/80 rounded-lg text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
                                                            Playing
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Up Next List */}
                        {upNext.length > 0 && (
                            <div className="animate-in slide-in-from-bottom-8 duration-700 delay-200">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Up Next</h3>
                                <div className="space-y-1">
                                    {upNext.map((track, i) => {
                                        // Determine real index in original queue
                                        const realIndex = currentIndex + 1 + i;
                                        return (
                                            <div
                                                key={`${track.id}-${realIndex}`}
                                                data-queue-index={realIndex}
                                                className="relative flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-white/5 active:cursor-grabbing select-none"
                                                onClick={() => dispatch(setCurrentTrack(track))}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, realIndex)}
                                                onDragEnter={(e) => handleDragEnter(e, realIndex)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDragEnd={handleDragEnd}
                                                onDrop={handleDrop}
                                            >
                                                {/* Drag Handle (Mobile/Desktop Visual) */}
                                                <div
                                                    className="text-slate-300 cursor-grab active:cursor-grabbing p-2 -ml-2 touch-none"
                                                    onTouchStart={(e) => handleTouchStart(e, realIndex)}
                                                    onTouchMove={handleTouchMove}
                                                    onTouchEnd={handleTouchEnd}
                                                >
                                                    <span className="material-icons-round text-lg">drag_indicator</span>
                                                </div>
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                                    <img src={getHighQualityImage(track.image)} alt={track.title} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                                        <span className="material-icons-round text-white">play_arrow</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 pr-8">
                                                    <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm leading-tight group-hover:text-primary transition-colors">{decodeHtmlEntities(track.title)}</h4>
                                                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{decodeHtmlEntities(track.artist)}</p>
                                                </div>

                                                <button
                                                    className="absolute right-2 p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(removeFromQueue(realIndex));
                                                    }}
                                                >
                                                    <span className="material-icons-round text-lg">delete_outline</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
