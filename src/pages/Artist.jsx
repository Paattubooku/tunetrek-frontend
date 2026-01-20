import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import { getHighQualityImage, extractIdFromUrl } from '../utils/imageUtils';
import { decodeHtmlEntities } from '../utils/stringUtils';
import API_URL from '../config/api.js';
import TrackMenu from '../components/common/TrackMenu';

export default function Artist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [artistData, setArtistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [allSongs, setAllSongs] = useState([]);
    const [allAlbums, setAllAlbums] = useState([]);
    const [songsPage, setSongsPage] = useState(0);
    const [albumsPage, setAlbumsPage] = useState(0);
    const [loadingSongs, setLoadingSongs] = useState(false);
    const [loadingAlbums, setLoadingAlbums] = useState(false);
    const [hasMoreSongs, setHasMoreSongs] = useState(true);
    const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
    const { currentTrack } = useAppSelector((state) => state.player);
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, [id]);

    useEffect(() => {
        const fetchArtistDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://mserver-pi.vercel.app/artist/${id}`);
                const data = await response.json();
                setArtistData(data);
                setAllSongs(data.topSongs || []);
                setAllAlbums(data.topAlbums || []);
            } catch (error) {
                console.error("Error fetching artist details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArtistDetails();
            setSongsPage(0);
            setAlbumsPage(0);
            setHasMoreSongs(true);
            setHasMoreAlbums(true);
        }
    }, [id]);

    const loadMoreSongs = async () => {
        if (loadingSongs || !hasMoreSongs) return;

        setLoadingSongs(true);
        try {
            const nextPage = songsPage + 1;
            const response = await fetch(`https://mserver-pi.vercel.app/artist/${id}?p=${nextPage}&sub_type=songs&more=true`);
            const data = await response.json();

            if (data.topSongs && data.topSongs.length > 0) {
                setAllSongs(prev => [...prev, ...data.topSongs]);
                setSongsPage(nextPage);
            } else {
                setHasMoreSongs(false);
            }
        } catch (error) {
            console.error("Error loading more songs:", error);
            setHasMoreSongs(false);
        } finally {
            setLoadingSongs(false);
        }
    };

    const loadMoreAlbums = async () => {
        if (loadingAlbums || !hasMoreAlbums) return;

        setLoadingAlbums(true);
        try {
            const nextPage = albumsPage + 1;
            const response = await fetch(`https://mserver-pi.vercel.app/artist/${id}?p=${nextPage}&sub_type=albums&more=true`);
            const data = await response.json();

            if (data.topAlbums && data.topAlbums.length > 0) {
                setAllAlbums(prev => [...prev, ...data.topAlbums]);
                setAlbumsPage(nextPage);
            } else {
                setHasMoreAlbums(false);
            }
        } catch (error) {
            console.error("Error loading more albums:", error);
            setHasMoreAlbums(false);
        } finally {
            setLoadingAlbums(false);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFollowers = (count) => {
        const num = parseInt(count);
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const handlePlaySong = (song, index) => {
        if (allSongs) {
            dispatch(setQueue(allSongs));
            dispatch(setCurrentTrack(song));
        }
    };

    const handlePlayAll = () => {
        if (allSongs && allSongs.length > 0) {
            dispatch(setQueue(allSongs));
            dispatch(setCurrentTrack(allSongs[0]));
        }
    };

    const SongRow = ({ song, index }) => (
        <div
            key={song.id}
            className={`group relative flex items-center gap-4 p-3 md:p-4 rounded-2xl transition-all cursor-pointer ${currentTrack?.id?.toString() === song.id?.toString()
                ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 shadow-lg'
                : 'hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            onClick={() => handlePlaySong(song, index)}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

            {/* Index / Play Button */}
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

            {/* Song Image */}
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:shadow-xl transition-shadow z-10">
                <img
                    src={getHighQualityImage(song.image)}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0 z-10">
                <h4 className={`font-bold text-sm md:text-base truncate transition-colors ${currentTrack?.id?.toString() === song.id?.toString()
                    ? 'text-primary'
                    : 'text-slate-800 dark:text-slate-100 group-hover:text-primary'
                    }`}>
                    {decodeHtmlEntities(song.title)}
                </h4>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">
                    {decodeHtmlEntities(song.subtitle)}
                </p>
            </div>

            {/* Duration */}
            <div className="hidden md:block text-sm text-slate-400 font-medium w-16 text-right z-10">
                {formatDuration(parseInt(song.more_info?.duration || 0))}
            </div>

            {/* Menu */}
            <TrackMenu song={song} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10" />
        </div>
    );

    const AlbumCard = ({ album }) => (
        <Link
            key={album.id}
            to={`/album/${extractIdFromUrl(album.perma_url) || album.id}`}
            className="group cursor-pointer flex flex-col gap-3"
        >
            <div className="aspect-square rounded-2xl overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                <img
                    src={getHighQualityImage(album.image)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="material-icons-round text-white text-2xl ml-0.5">play_arrow</span>
                    </div>
                </div>
            </div>
            <div className="px-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm md:text-base group-hover:text-primary transition-colors">
                    {decodeHtmlEntities(album.title)}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{album.year}</p>
            </div>
        </Link>
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

    if (!artistData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                <span className="material-icons-round text-6xl opacity-20">person</span>
                <p>Artist not found</p>
                <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-24">
            {/* Hero Section */}
            <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 dark:from-primary/30 dark:via-purple-500/30 dark:to-pink-500/30">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 px-6 md:px-12 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                        {/* Artist Image */}
                        <div className="shrink-0 group">
                            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/20">
                                <img
                                    src={getHighQualityImage(artistData.image)}
                                    alt={artistData.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            </div>
                        </div>

                        {/* Artist Info */}
                        <div className="flex-1 text-center md:text-left">
                            {/* Verified Badge */}
                            {artistData.isVerified && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mb-4">
                                    <span className="material-icons-round text-primary text-lg">verified</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">Verified Artist</span>
                                </div>
                            )}

                            {/* Name */}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white mb-4 tracking-tighter leading-none">
                                {decodeHtmlEntities(artistData.name)}
                            </h1>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm md:text-base mb-6">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="material-icons-round text-lg text-primary">people</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{formatFollowers(artistData.follower_count)} Followers</span>
                                </div>
                                {artistData.dominantLanguage && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                        <span className="material-icons-round text-lg text-primary">language</span>
                                        <span className="font-semibold text-slate-800 dark:text-white capitalize">{artistData.dominantLanguage}</span>
                                    </div>
                                )}
                                {artistData.dominantType && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20">
                                        <span className="material-icons-round text-lg text-primary">music_note</span>
                                        <span className="font-semibold text-slate-800 dark:text-white capitalize">{artistData.dominantType}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <button
                                    onClick={handlePlayAll}
                                    className="group relative bg-gradient-to-r from-primary to-purple-500 hover:from-primary-focus hover:to-purple-600 text-white h-14 px-8 rounded-full font-bold text-base transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="material-icons-round text-2xl relative z-10">play_circle_filled</span>
                                    <span className="relative z-10">Play All</span>
                                </button>
                                <button className="w-14 h-14 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 text-slate-800 dark:text-white flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110 hover:border-primary hover:text-primary active:scale-95 transition-all shadow-lg">
                                    <span className="material-icons-round text-xl">favorite_border</span>
                                </button>
                                <button className="w-14 h-14 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 text-slate-800 dark:text-white flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 hover:scale-110 hover:border-primary hover:text-primary active:scale-95 transition-all shadow-lg">
                                    <span className="material-icons-round text-xl">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
                <div className="flex items-center gap-2 p-1 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20 dark:border-white/10 backdrop-blur-md w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview'
                            ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('songs')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'songs'
                            ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Songs
                    </button>
                    <button
                        onClick={() => setActiveTab('albums')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'albums'
                            ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Albums
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Top Songs */}
                    {artistData.topSongs && artistData.topSongs.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <span className="w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-full"></span>
                                    Top Songs
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {artistData.topSongs.slice(0, 10).map((song, index) => (
                                    <SongRow key={song.id} song={song} index={index} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Albums */}
                    {artistData.topAlbums && artistData.topAlbums.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                                    Top Albums
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {artistData.topAlbums.map((album) => (
                                    <AlbumCard key={album.id} album={album} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Playlists */}
                    {artistData.dedicated_artist_playlist && artistData.dedicated_artist_playlist.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <span className="w-1 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full"></span>
                                    Featured Playlists
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {artistData.dedicated_artist_playlist.slice(0, 8).map((playlist) => (
                                    <Link
                                        key={playlist.id}
                                        to={`/playlist/${extractIdFromUrl(playlist.perma_url) || playlist.id}`}
                                        className="group cursor-pointer flex flex-col gap-3"
                                    >
                                        <div className="aspect-square rounded-2xl overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                            <img
                                                src={getHighQualityImage(playlist.image)}
                                                alt={playlist.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <span className="material-icons-round text-white text-2xl ml-0.5">play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-1">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm md:text-base group-hover:text-primary transition-colors">
                                                {decodeHtmlEntities(playlist.title)}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{playlist.subtitle}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Singles */}
                    {artistData.singles && artistData.singles.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <span className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
                                    Singles
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {artistData.singles.slice(0, 10).map((single) => (
                                    <AlbumCard key={single.id} album={single} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'songs' && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <span className="w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-full"></span>
                            All Songs
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {allSongs.map((song, index) => (
                            <SongRow key={song.id} song={song} index={index} />
                        ))}
                    </div>
                    {hasMoreSongs && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreSongs}
                                disabled={loadingSongs}
                                className="px-8 py-4 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-slate-800 dark:text-white font-bold hover:bg-white/60 dark:hover:bg-white/10 hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loadingSongs ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-round">expand_more</span>
                                        <span>Load More</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'albums' && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                            All Albums
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {allAlbums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                    {hasMoreAlbums && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreAlbums}
                                disabled={loadingAlbums}
                                className="px-8 py-4 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-slate-800 dark:text-white font-bold hover:bg-white/60 dark:hover:bg-white/10 hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loadingAlbums ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-round">expand_more</span>
                                        <span>Load More</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
