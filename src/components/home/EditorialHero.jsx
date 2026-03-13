import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rawg } from "../../api/rawg";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export const EditorialHero = () => {
    const [topGames, setTopGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopGames = async () => {
            try {
                const res = await fetch(`${rawg.baseUrl}/games?key=${rawg.key}&ordering=-rating&metacritic=90,100&page_size=4`);
                const data = await res.json();
                setTopGames(data.results || []);
            } catch (err) {
                console.error("Hero fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopGames();
    }, []);

    if (loading || topGames.length < 4) {
        return (
            <div className="w-full h-[85vh] bg-[#0a0a0a] animate-pulse flex gap-4 p-4">
                <div className="flex-[0.6] bg-[#111] rounded-2xl"></div>
                <div className="flex-[0.4] flex flex-col gap-4">
                    <div className="flex-1 bg-[#111] rounded-2xl"></div>
                    <div className="flex-1 bg-[#111] rounded-2xl"></div>
                    <div className="flex-1 bg-[#111] rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const heroGame = topGames[0];
    const sideGames = topGames.slice(1, 4);

    return (
        <section className="w-full h-auto lg:h-[90vh] grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 p-4 lg:p-6 bg-[#0a0a0a] overflow-hidden">
            
            {/* Main Hero Card */}
            <Link 
                to={`/game/${heroGame.id}`}
                className="relative group overflow-hidden rounded-[32px] border border-[#1a1a1a] flex flex-col justify-end"
            >
                <div className="absolute inset-0">
                    <img 
                        src={heroGame.background_image} 
                        alt={heroGame.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Triple Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 top-0 left-0 w-1/2 h-full"></div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </div>

                <div className="relative z-10 p-8 md:p-12 max-w-3xl">
                    <span className="inline-block text-[10px] font-black tracking-[0.2em] text-[var(--accent)] uppercase mb-4">
                        EDITOR'S PICK · THIS WEEK
                    </span>
                    <h2 className="font-syne text-[48px] md:text-[84px] font-[900] leading-[0.85] text-white mb-8 tracking-tighter">
                        {heroGame.name.toUpperCase()}
                    </h2>
                    
                    <div className="flex items-center gap-6">
                        <div className="px-8 py-4 bg-[var(--accent)] text-black font-syne font-black text-[14px] rounded-full uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
                             Full Review <FiArrowRight size={18} />
                        </div>
                        <span className="text-[13px] text-[#888] font-medium hidden md:block">
                            <span className="text-white font-bold">10,432</span> players have a verdict on this
                        </span>
                    </div>
                </div>
            </Link>

            {/* Side Stack */}
            <div className="flex flex-col gap-4">
                {sideGames.map((game) => (
                    <Link 
                        key={game.id}
                        to={`/game/${game.id}`}
                        className="flex-1 relative group overflow-hidden rounded-[24px] border border-[#1a1a1a] flex flex-col justify-end min-h-[200px]"
                    >
                        <div className="absolute inset-0">
                            <img 
                                src={game.background_image} 
                                alt={game.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                        </div>
                        <div className="relative z-10 p-6">
                            <h3 className="font-syne text-[20px] md:text-[24px] font-black text-white leading-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                                {game.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider">Metacritic {game.metacritic}</span>
                                <span className="w-1 h-1 rounded-full bg-[#333]"></span>
                                <span className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-wider">Must Play</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
