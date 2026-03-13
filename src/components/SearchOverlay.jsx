import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { rawg } from '../api/rawg';

export const SearchOverlay = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('gridlock_recent_searches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, [isOpen]);

    // Handle K-Key shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onClose(false); // Toggle logic handled at parent usually, but let's assume parent controls it
            }
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // Live search
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(rawg.search(query, 6));
                const data = await res.json();
                setResults(data.results || []);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (game) => {
        // Save to recent
        const newRecent = [game.name, ...recentSearches.filter(s => s !== game.name)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('gridlock_recent_searches', JSON.stringify(newRecent));
        
        navigate(`/game/${game.id}`);
        onClose();
    };

    const handleRecentClick = (s) => {
        setQuery(s);
        inputRef.current?.focus();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#161616] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 px-6 h-16 border-b border-white/5">
                            <FiSearch size={20} className={loading ? "text-accent animate-pulse" : "text-white/40"} />
                            <input 
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search games, categories, or players..."
                                className="flex-1 bg-transparent border-none outline-none text-white text-[16px] placeholder:text-white/20"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-1 hover:bg-white/5 rounded-md text-white/40">
                                    <FiX size={18} />
                                </button>
                            )}
                            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5 text-[10px] text-white/40 font-medium">
                                <span>ESC</span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                            {!query && recentSearches.length > 0 && (
                                <div className="p-4">
                                    <h3 className="text-[11px] uppercase tracking-wider text-white/30 font-bold px-4 mb-2">Recent Searches</h3>
                                    <div className="flex flex-col">
                                        {recentSearches.map((s, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleRecentClick(s)}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all text-left"
                                            >
                                                <FiClock size={14} className="text-white/20" />
                                                <span className="text-[14px]">{s}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && !loading && results.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-white/40 text-[14px]">No games found for "{query}"</p>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="p-2">
                                    <h3 className="text-[11px] uppercase tracking-wider text-white/30 font-bold px-4 pt-2 mb-2">Games</h3>
                                    <div className="flex flex-col gap-1">
                                        {results.map((game) => (
                                            <button 
                                                key={game.id} 
                                                onClick={() => handleSelect(game)}
                                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 group transition-all text-left"
                                            >
                                                <div className="w-10 h-14 rounded-md overflow-hidden bg-[#222]">
                                                    <img src={game.background_image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[15px] font-bold text-white group-hover:text-accent transition-colors truncate">{game.name}</div>
                                                    <div className="text-[12px] text-white/40">
                                                        {game.released?.split('-')[0]} • {game.genres?.slice(0, 2).map(g => g.name).join(', ')}
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-white/5 rounded text-[12px] font-bold text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Go to game
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!query && (
                                <div className="p-4 bg-white/[0.02]">
                                    <h3 className="text-[11px] uppercase tracking-wider text-white/30 font-bold px-4 mb-2">trending right now</h3>
                                    <div className="grid grid-cols-2 gap-2 px-2">
                                        {['Cyberpunk 2077', 'Elden Ring', 'GTA V', 'Dead Space'].map((s, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleRecentClick(s)}
                                                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/5 hover:border-accent/40 bg-[#1a1a1a] text-white/70 hover:text-white transition-all text-[13px] text-left"
                                            >
                                                <FiTrendingUp size={12} className="text-accent" />
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-medium tracking-wide">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-white/10 rounded">↵</span> Select</span>
                                <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</span> Navigate</span>
                            </div>
                            <div className="flex items-center gap-1">
                                Search by <span className="text-white/60">RAWG</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
