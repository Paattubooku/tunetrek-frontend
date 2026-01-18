import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { useAppDispatch } from '../store/hooks';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import { decodeHtmlEntities } from '../utils/stringUtils';
import TrackMenu from '../components/common/TrackMenu';
import AlbumMenu from '../components/common/AlbumMenu';
import API_URL from '../config/api.js';

// --- Sub-Components for Tabs ---

const TabButton = ({ active, label, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`relative px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 flex items-center gap-2 ${active
            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
    >
        {icon && <span className="material-icons-round text-lg">{icon}</span>}
        {label}
    </button>
);

const SongRow = ({ song, index, playingTrack, onPlay }) => (
    <div
        className={`group relative flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer border ${playingTrack === song.id
            ? 'bg-primary/10 border-primary/20 dark:bg-primary/20'
            : 'hover:bg-slate-100/50 dark:hover:bg-white/5 border-transparent'
            }`}
        onClick={() => onPlay(song, index)}
    >
        <div className="w-8 h-8 flex items-center justify-center shrink-0 text-slate-400 font-bold text-sm">
            {playingTrack === song.id ? (
                <span className="material-icons-round text-primary animate-pulse">graphic_eq</span>
            ) : (
                <>
                    <span className="group-hover:hidden">{index + 1}</span>
                    <span className="material-icons-round hidden group-hover:block text-slate-800 dark:text-white">play_arrow</span>
                </>
            )}
        </div>

        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
            <img
                src={getHighQualityImage(song.image)}
                alt={song.title}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>

        <div className="flex-1 min-w-0">
            <h4 className={`font-bold truncate text-sm md:text-base ${playingTrack === song.id ? 'text-primary' : 'text-slate-800 dark:text-slate-100'}`}>
                {decodeHtmlEntities(song.title)}
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">
                {decodeHtmlEntities(song.subtitle || song.album)}
            </p>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="opacity-80">{parseInt(song.play_count || 0).toLocaleString()}</span>
        </div>

        <div className="text-xs text-slate-400 font-bold w-12 text-right">
            {song.more_info?.duration ? (
                `${Math.floor(song.more_info.duration / 60)}:${(song.more_info.duration % 60).toString().padStart(2, '0')}`
            ) : '-'}
        </div>

        <TrackMenu song={song} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 ml-2" />
    </div>
);

const AlbumCard = ({ item, typeOverride }) => {
    const type = typeOverride || item.type || 'album';
    const id = extractIdFromUrl(item.perma_url) || item.id;
    const isArtist = type === 'artist';
    let route = `/album/${id}`;
    if (type === 'artist') route = `/artist/${id}`;

    return (
        <Link
            to={route}
            className="group cursor-pointer flex flex-col gap-3"
        >
            <div className={`aspect-square overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all duration-500 z-10 ${isArtist ? 'rounded-full' : 'rounded-2xl'}`}>
                <img
                    src={getHighQualityImage(item.image)}
                    alt={item.title || item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-xl scale-50 group-hover:scale-100 transition-all duration-300 hover:bg-primary hover:border-primary">
                        <span className="material-icons-round text-3xl ml-1">
                            {isArtist ? 'person' : 'play_arrow'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="px-1 text-center">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm group-hover:text-primary transition-colors">
                    {item.title || item.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {item.year || item.subtitle || (type === 'artist' ? 'Artist' : 'Album')}
                </p>
            </div>
        </Link>
    );
};


// --- Main Page Component ---

export default function Artist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [artistData, setArtistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playingTrack, setPlayingTrack] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const containerRef = useRef(null);

    // Scroll to top when ID changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
        setActiveTab('overview'); // Reset tab on navigation
    }, [id]);

    useEffect(() => {
        const fetchArtistDetails = async () => {
            setLoading(true);
            try {
                if (!id) return;
                const response = await fetch(`${API_URL}/details/${id}/artist`);
                const data = await response.json();
                setArtistData(data);
            } catch (error) {
                console.error("Error fetching artist details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArtistDetails();
        }
    }, [id]);

    const handlePlayAll = () => {
        if (artistData?.topSongs && artistData.topSongs.length > 0) {
            dispatch(setQueue(artistData.topSongs));
            dispatch(setCurrentTrack(artistData.topSongs[0]));
            setPlayingTrack(artistData.topSongs[0].id);
        }
    };

    const handlePlaySong = (song, index) => {
        dispatch(setQueue(artistData.topSongs)); // Use available songs context or fetch full song list if needed
        dispatch(setCurrentTrack(song));
        setPlayingTrack(song.id);
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

    if (!artistData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                <span className="material-icons-round text-6xl opacity-20">person_off</span>
                <p>Artist not found</p>
                <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    // Extract Listeners count
    let listenersCount = null;
    if (artistData.subtitle && artistData.subtitle.includes('Listeners')) {
        const parts = artistData.subtitle.split('•');
        if (parts.length > 1) {
            listenersCount = parts[1].trim();
        }
    }

    // --- Tab Views ---

    const renderOverview = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Songs & Bio Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Top Songs</h3>
                        <button onClick={() => setActiveTab('songs')} className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-1">
                        {artistData.topSongs?.map((song, index) => (
                            <SongRow key={song.id} song={song} index={index} playingTrack={playingTrack} onPlay={handlePlaySong} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Bio Card */}
                    <div className="glass-panel-light dark:glass-panel bg-white/50 dark:bg-white/5 p-6 rounded-3xl h-full border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-icons-round text-2xl text-slate-400">auto_stories</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile</h3>
                        </div>
                        {artistData.bio && (artistData.bio.length > 0 || Array.isArray(artistData.bio)) ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-[8]">
                                {Array.isArray(artistData.bio) ? artistData.bio[0]?.text : artistData.bio}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-500">No biography available.</p>
                        )}
                        {artistData.dob && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between text-sm">
                                <span className="text-slate-500">Born</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{artistData.dob}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Albums Slider */}
            {artistData.topAlbums && artistData.topAlbums.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Top Albums</h3>
                        <button onClick={() => setActiveTab('albums')} className="text-sm font-bold text-primary hover:underline">View More</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory -mx-2 px-6">
                        {artistData.topAlbums.map((album) => (
                            <div key={album.id} className="w-48 shrink-0 snap-center">
                                <AlbumCard item={album} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Singles Slider */}
            {artistData.singles && artistData.singles.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Singles</h3>
                        <button onClick={() => setActiveTab('singles')} className="text-sm font-bold text-primary hover:underline">View More</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory -mx-2 px-6">
                        {artistData.singles.map((single) => (
                            <div key={single.id} className="w-48 shrink-0 snap-center">
                                <AlbumCard item={single} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Similar Artists */}
            {artistData.similarArtists && artistData.similarArtists.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Fans Also Like</h3>
                    <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory -mx-2 px-6">
                        {artistData.similarArtists.map((artist) => (
                            <div key={artist.id} className="w-40 shrink-0 snap-center">
                                <AlbumCard item={artist} typeOverride="artist" />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );

    const renderSongsTab = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">All Songs</h3>
            </div>
            <div className="space-y-1">
                {artistData.topSongs?.map((song, index) => (
                    <SongRow key={song.id} song={song} index={index} playingTrack={playingTrack} onPlay={handlePlaySong} />
                ))}
            </div>
            {(!artistData.topSongs || artistData.topSongs.length === 0) && (
                <div className="text-center py-20 text-slate-500">No songs available</div>
            )}
        </div>
    );

    const renderGridTab = (items, title, type = 'album') => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {items?.map((item) => (
                    <AlbumCard key={item.id} item={item} typeOverride={type} />
                ))}
            </div>
            {(!items || items.length === 0) && (
                <div className="text-center py-20 text-slate-500">No content available</div>
            )}
        </div>
    );


    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-32">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl shadow-black/20">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-pink-500/30">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[1px]"></div>
                </div>

                <div className="relative z-10 px-6 md:px-12 py-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left">
                        {/* Image */}
                        <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/20">
                            <img
                                src={getHighQualityImage(artistData.image)}
                                alt={artistData.name}
                                className="w-full h-full object-cover scale-105"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1 pb-4">
                            {artistData.isVerified && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                                    <span className="material-icons-round text-sm">verified</span>
                                    Verified Artist
                                </div>
                            )}

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-800 dark:text-white tracking-tighter sm:leading-none mb-4">
                                {artistData.name}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 text-slate-600 dark:text-slate-300">
                                <span className="uppercase tracking-widest font-semibold text-sm">
                                    {artistData.dominantType || 'Music Artist'}
                                </span>
                                {listenersCount && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                        <span className="font-medium">{listenersCount}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <button
                                    onClick={handlePlayAll}
                                    className="bg-primary hover:bg-primary-focus text-white h-12 px-8 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                                >
                                    <span className="material-icons-round text-2xl">play_circle</span>
                                    Play All
                                </button>
                                <button className="h-12 w-12 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                    <span className="material-icons-round text-slate-600 dark:text-slate-200">favorite_border</span>
                                </button>
                                <AlbumMenu data={{ list: artistData.topSongs }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-30 -mx-2 px-6 py-4 mb-2 border-b border-gray-200 dark:border-white/10 flex gap-2 overflow-x-auto hide-scrollbar">
                <TabButton active={activeTab === 'overview'} label="Overview" onClick={() => setActiveTab('overview')} />
                <TabButton active={activeTab === 'songs'} label="Songs" onClick={() => setActiveTab('songs')} />
                <TabButton active={activeTab === 'albums'} label="Albums" onClick={() => setActiveTab('albums')} />
            </div>

            {/* Tab Content */}
            <div className="mt-6 min-h-[400px]">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'songs' && renderSongsTab()}
                {activeTab === 'albums' && renderGridTab(artistData.topAlbums, 'Albums', 'album')}
            </div>

        </div>
    );
}
