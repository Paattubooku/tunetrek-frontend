import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, usePreferences, useAuth } from '../../store/hooks';
import { setSelectedLanguages } from '../../store/slices/preferencesSlice';
import { logout } from '../../store/slices/authSlice';
import { setCurrentTrack, setQueue } from '../../store/slices/playerSlice';
import { getHighQualityImage, extractIdFromUrl } from '../../utils/imageUtils';
import { decodeHtmlEntities } from '../../utils/stringUtils';
import TrackMenu from '../common/TrackMenu';
import API_URL from '../../config/api.js';

export default function Header() {
    const dispatch = useAppDispatch();
    const { selectedLanguages } = usePreferences();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef(null);
    const containerRef = useRef(null);

    // New Search Features State
    const [topSearches, setTopSearches] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);

    // Load recent searches
    useEffect(() => {
        try {
            const saved = localStorage.getItem('recent_searches');
            if (saved) setRecentSearches(JSON.parse(saved));
        } catch (e) {
            console.warn("Failed to load recent searches", e);
        }
    }, []);

    // Fetch Top Searches
    useEffect(() => {
        if (isSearchOpen && topSearches.length === 0) {
            const langParam = selectedLanguages.length > 0 ? selectedLanguages.join(',') : 'tamil,english';
            fetch(`${API_URL}/top-searches?language=${langParam}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setTopSearches(data);
                })
                .catch(e => console.error("Top searches fetch error:", e));
        }
    }, [isSearchOpen, selectedLanguages]);

    const addToRecent = (item) => {
        const newItem = {
            id: item.id,
            title: item.title,
            type: item.type,
            image: item.image,
            url: item.url || '',
            subtitle: item.subtitle
        };

        const updated = [newItem, ...recentSearches.filter(i => i.id !== item.id)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recent_searches');
    };

    // Profile State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [tempSelectedLanguages, setTempSelectedLanguages] = useState(selectedLanguages);
    const profileRef = useRef(null);

    const LANGUAGES = [
        { id: 'tamil', label: 'Tamil' },
        { id: 'english', label: 'English' },
        { id: 'malayalam', label: 'Malayalam' },
        { id: 'telugu', label: 'Telugu' },
        { id: 'hindi', label: 'Hindi' },
        { id: 'kannada', label: 'Kannada' },
        { id: 'punjabi', label: 'Punjabi' },
        { id: 'marathi', label: 'Marathi' },
        { id: 'gujarati', label: 'Gujarati' },
        { id: 'bengali', label: 'Bengali' },
        { id: 'bhojpuri', label: 'Bhojpuri' },
        { id: 'urdu', label: 'Urdu' },
        { id: 'haryanvi', label: 'Haryanvi' },
        { id: 'rajasthani', label: 'Rajasthani' },
        { id: 'odia', label: 'Odia' },
        { id: 'assamese', label: 'Assamese' }
    ];

    // Focus input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Handle click outside to close (Search & Profile)
    useEffect(() => {
        function handleClickOutside(event) {
            // Close Search
            if (containerRef.current && !containerRef.current.contains(event.target) && isSearchOpen) {
                setIsSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
            }
            // Close Profile
            if (profileRef.current && !profileRef.current.contains(event.target) && isProfileOpen) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchOpen, isProfileOpen]);

    // Search API Call with Debounce and Language
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                setLoading(true);
                try {
                    const langParam = selectedLanguages.length > 0 ? selectedLanguages.join(',') : 'tamil,english';
                    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}&language=${langParam}`);
                    if (!response.ok) throw new Error('Search failed');

                    const responseData = await response.json();

                    const mapItem = (item, typeOverride) => ({
                        ...item,
                        title: item.title,
                        image: getHighQualityImage(item.image),
                        type: typeOverride || item.type,
                        subtitle: item.description || item.subtitle || item.music || ''
                    });

                    const extractData = (key) => {
                        if (responseData[key] && responseData[key].data && Array.isArray(responseData[key].data)) {
                            return responseData[key].data;
                        }
                        return [];
                    };

                    const categorizedResults = {};

                    if (responseData["Top Results"] && responseData["Top Results"].data) {
                        categorizedResults["Top Results"] = responseData["Top Results"].data.map(i => mapItem(i));
                    }

                    const songs = extractData("Songs");
                    if (songs.length > 0) categorizedResults["Songs"] = songs.map(i => mapItem(i, 'song'));

                    const albums = extractData("Albums");
                    if (albums.length > 0) categorizedResults["Albums"] = albums.map(i => mapItem(i, 'album'));

                    const artists = extractData("Artists");
                    if (artists.length > 0) categorizedResults["Artists"] = artists.map(i => mapItem(i, 'artist'));

                    const playlists = extractData("Playlists");
                    if (playlists.length > 0) categorizedResults["Playlists"] = playlists.map(i => mapItem(i, 'playlist'));

                    setSearchResults(categorizedResults);
                } catch (error) {
                    console.error("Search API Error:", error);
                    setSearchResults({});
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults({});
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedLanguages]);

    const hasResults = Object.keys(searchResults).length > 0;

    return (
        <header className="sticky top-0 z-40 glass-panel-light dark:glass-panel bg-white/80 dark:bg-[#0a192f]/80 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between relative shrink-0 gap-4 transition-all duration-300 border border-white/20 dark:border-white/5 shadow-lg shadow-black/5">

            {/* Left: Logo (Mobile) & Breadcrumbs (Desktop) */}
            <div className={`flex items-center gap-4 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
                {/* Mobile Logo */}
                <Link to="/" className="flex md:hidden items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/30">
                        <span className="material-icons-round text-lg">graphic_eq</span>
                    </div>
                </Link>

                <div className="flex gap-2 shrink-0">
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                        <Link to="/" className="hover:text-slate-800 dark:hover:text-white transition-colors">Home</Link>
                        {!isHome && (
                            <>
                                <span className="material-icons-round text-xs">chevron_right</span>
                                <span className="text-slate-900 dark:text-white font-medium">
                                    {location.pathname.includes('/artist')
                                        ? 'Artist'
                                        : location.pathname.includes('/album')
                                            ? 'Album'
                                            : location.pathname.includes('/playlist')
                                                ? 'Playlist'
                                                : location.pathname.includes('/favorites')
                                                    ? 'Favorites'
                                                    : location.pathname.includes('/library')
                                                        ? 'Library'
                                                        : location.pathname.includes('/view-all')
                                                            ? 'View All'
                                                            : 'Page'}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Search & Profile */}
            <div className="flex items-center gap-3">

                {/* Collapsible Search Bar Container */}
                <div
                    ref={containerRef}
                    className={`
                        group flex items-center transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                        ${isSearchOpen
                            ? 'absolute inset-x-4 top-1/2 -translate-y-1/2 z-50 md:static md:inset-auto md:translate-y-0 md:w-96'
                            : 'relative w-10 md:w-64 cursor-pointer md:cursor-text'
                        }
                    `}>

                    {/* Input Wrapper */}
                    <div
                        className={`
                            relative w-full h-11 flex items-center rounded-2xl overflow-hidden transition-all duration-300
                            ${isSearchOpen
                                ? 'bg-white dark:bg-[#112240] shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:ring-white/10'
                                : 'bg-transparent md:bg-black/5 md:dark:bg-white/10 md:hover:bg-black/10 md:dark:hover:bg-white/15'
                            }
                        `}
                        onClick={() => {
                            if (!isSearchOpen) {
                                setIsSearchOpen(true);
                                setTimeout(() => searchInputRef.current?.focus(), 100);
                            }
                        }}
                    >
                        {/* Search Icon */}
                        <div className="flex items-center justify-center w-11 h-11 shrink-0 pointer-events-none">
                            <span className={`material-icons-round text-xl transition-colors duration-300 ${isSearchOpen ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                search
                            </span>
                        </div>

                        {/* Input Field */}
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`
                                w-full h-full bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-gray-100 placeholder:text-slate-400
                                ${isSearchOpen ? 'pr-10' : 'cursor-pointer md:cursor-text pr-4'}
                            `}
                            placeholder="Search songs, albums, artists..."
                            onFocus={() => setIsSearchOpen(true)}
                        />

                        {/* Close Button */}
                        {isSearchOpen && (
                            <div className="absolute right-2 flex items-center">
                                {loading && (
                                    <span className="material-icons-round text-primary text-lg animate-spin mr-2">refresh</span>
                                )}
                                <button
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-red-500 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (searchQuery) {
                                            setSearchQuery('');
                                            searchInputRef.current?.focus();
                                        } else {
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                >
                                    <span className="material-icons-round text-lg">close</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search Dropdown Results */}
                    {isSearchOpen && (
                        <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                            <div className="flex flex-col max-h-[65vh] overflow-y-auto hide-scrollbar p-2">
                                {searchQuery.length > 2 ? (
                                    <>
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                                <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3"></div>
                                                <p className="text-xs font-medium tracking-wide">Searching Global Database...</p>
                                            </div>
                                        ) : hasResults ? (
                                            Object.entries(searchResults).map(([category, items]) => (
                                                <div key={category} className="mb-4 last:mb-0">
                                                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-gradient-to-r from-transparent via-transparent to-transparent opacity-70 flex items-center gap-2">
                                                        {category}
                                                        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-1">
                                                        {items.map(result => {
                                                            const isSong = result.type === 'song';
                                                            const linkTo = result.type === 'artist' ? `/artist/${extractIdFromUrl(result.url)}`
                                                                : result.type === 'album' ? `/album/${extractIdFromUrl(result.url)}`
                                                                    : result.type === 'playlist' ? `/playlist/${extractIdFromUrl(result.url)}`
                                                                        : '#';

                                                            return (
                                                                <div
                                                                    key={result.id}
                                                                    className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 flex items-center gap-3 transition-colors group cursor-pointer relative"
                                                                    onClick={(e) => {
                                                                        if (isSong) {
                                                                            dispatch(setCurrentTrack(result));
                                                                            dispatch(setQueue([result]));
                                                                        } else {
                                                                            navigate(linkTo);
                                                                        }
                                                                        addToRecent(result);
                                                                        setIsSearchOpen(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                >
                                                                    <div className="relative w-11 h-11 shrink-0">
                                                                        <img
                                                                            src={result.image}
                                                                            alt={result.title}
                                                                            onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                                                            className={`w-full h-full object-cover shadow-sm ${result.type === 'artist' ? 'rounded-full' : 'rounded-[10px]'}`}
                                                                        />
                                                                        {isSong && (
                                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px]">
                                                                                <span className="material-icons-round text-white text-xl drop-shadow-lg">play_arrow</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0 z-10">
                                                                        <h5 className="text-sm font-semibold text-slate-800 dark:text-gray-100 truncate flex items-center gap-2">
                                                                            {decodeHtmlEntities(result.title)}
                                                                        </h5>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">{result.type}</span>
                                                                            {result.subtitle && <span className="text-xs text-slate-500 dark:text-slate-400 truncate">• {decodeHtmlEntities(result.subtitle)}</span>}
                                                                        </div>
                                                                    </div>

                                                                    {isSong && (
                                                                        <div
                                                                            className="z-20 opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <TrackMenu song={result} />
                                                                        </div>
                                                                    )}

                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 opacity-60">
                                                <span className="material-icons-round text-4xl mb-3">manage_search</span>
                                                <p className="text-sm">We couldn't find anything for "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-4 space-y-6">
                                        {/* Recent Searches */}
                                        {recentSearches.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Searches</h4>
                                                    <button onClick={clearRecent} className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Clear</button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {recentSearches.map(item => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer group"
                                                            onClick={() => {
                                                                if (item.type === 'song') {
                                                                    dispatch(setCurrentTrack(item));
                                                                    dispatch(setQueue([item]));
                                                                } else {
                                                                    const linkTo = item.type === 'artist' ? `/artist/${extractIdFromUrl(item.url)}`
                                                                        : item.type === 'album' ? `/album/${extractIdFromUrl(item.url)}`
                                                                            : item.type === 'playlist' ? `/playlist/${extractIdFromUrl(item.url)}`
                                                                                : '#';
                                                                    navigate(linkTo);
                                                                }
                                                                addToRecent(item);
                                                                setIsSearchOpen(false);
                                                            }}
                                                        >
                                                            <div className="w-8 h-8 rounded shrink-0 overflow-hidden">
                                                                <img src={item.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                                                                    {decodeHtmlEntities(item.title)}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 truncate">{item.type} • {decodeHtmlEntities(item.subtitle)}</p>
                                                            </div>
                                                            <span className="material-icons-round text-slate-300 text-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">north_west</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Trending Searches */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Trending Now</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {topSearches.length > 0 ? (
                                                    topSearches.map((item, idx) => (
                                                        <button
                                                            key={`top-${idx}`}
                                                            onClick={() => {
                                                                setSearchQuery(item.title);
                                                                searchInputRef.current?.focus();
                                                            }}
                                                            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-transparent hover:border-primary/30 hover:text-primary text-sm font-medium text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5 group"
                                                        >
                                                            <span className="material-icons-round text-xs text-slate-400 group-hover:text-primary">trending_up</span>
                                                            {decodeHtmlEntities(item.title)}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="w-full text-center py-8 text-slate-500 text-xs">Loading trending searches...</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile / Login */}
                {localStorage.getItem('token') ? (
                    <div className={`relative ${isSearchOpen ? 'hidden md:block' : ''}`} ref={profileRef}>
                        <div
                            className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden border-2 border-white/20 shrink-0 z-20 relative cursor-pointer hover:border-primary transition-colors flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20"
                            onClick={() => {
                                setIsProfileOpen(!isProfileOpen);
                                setTempSelectedLanguages(selectedLanguages);
                            }}
                        >
                            <span className="text-white font-bold text-lg select-none">
                                {(() => {
                                    try {
                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                        return user.username ? user.username[0].toUpperCase() : 'U';
                                    } catch (e) {
                                        return 'U';
                                    }
                                })()}
                            </span>
                        </div>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="p-4 border-b border-white/5 bg-white/5">
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Music Languages</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Customize your search & feed</p>
                                </div>
                                <div className="p-2 grid grid-cols-2 gap-1 max-h-60 overflow-y-auto hide-scrollbar">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.id}
                                            onClick={() => {
                                                if (tempSelectedLanguages.includes(lang.id)) {
                                                    setTempSelectedLanguages(tempSelectedLanguages.filter(l => l !== lang.id));
                                                } else {
                                                    setTempSelectedLanguages([...tempSelectedLanguages, lang.id]);
                                                }
                                            }}
                                            className={`
                                                px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between group
                                                ${tempSelectedLanguages.includes(lang.id)
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            {lang.label}
                                            {tempSelectedLanguages.includes(lang.id) && (
                                                <span className="material-icons-round text-[10px]">check</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-2 border-t border-white/5 bg-white/5 flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            dispatch(setSelectedLanguages(tempSelectedLanguages));
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-focus  text-white shadow-lg shadow-primary/25 transition-all text-xs font-bold uppercase tracking-wider"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            dispatch(logout());
                                            window.location.href = '/login';
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors text-xs font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="bg-primary hover:bg-opacity-90 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 transition-all">
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}
