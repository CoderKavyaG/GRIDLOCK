import React from 'react';
import { Link } from 'react-router-dom';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FiArrowRight } from 'react-icons/fi';

const GameCard = ({ game, rank }) => {
    if (!game) return null;

    const releaseYear = game.released ? new Date(game.released).getFullYear() : null;

    return (
        <Link to={`/game/${game.id}`} className="group flex flex-col cursor-pointer" title={game.name}>
            {/* Card Image */}
            <div className="relative w-full aspect-[3/4] rounded-[10px] overflow-hidden border border-[#1e1e1e] transition-all duration-300 group-hover:border-[var(--accent)] group-hover:shadow-[0_0_24px_rgba(232,255,71,0.1)]">

                {game.background_image ? (
                    <img
                        src={game.background_image}
                        alt={game.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                        <IoGameControllerOutline size={32} className="text-[#333]" />
                    </div>
                )}

                {/* Rank Badge */}
                {rank !== undefined && (
                    <div className="absolute top-[8px] left-[8px] bg-black/80 backdrop-blur-[4px] rounded-[4px] px-[8px] py-[2px] font-syne text-[13px] font-[800] text-[var(--accent)] z-10 border border-[var(--accent)]/20">
                        #{rank.toString().padStart(2, '0')}
                    </div>
                )}

                {/* Metacritic Badge */}
                {game.metacritic && !rank && (
                    <div className={`absolute top-[8px] right-[8px] font-syne font-[900] text-[12px] px-[8px] py-[4px] rounded-md z-10 shadow-lg ${
                        game.metacritic >= 90 ? 'bg-[#2ed573] text-black' 
                        : game.metacritic >= 75 ? 'bg-[#ffa502] text-black' 
                        : 'bg-[#ff4757] text-white'
                    }`}>
                        {game.metacritic}
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-[1]"></div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[2] flex items-end p-3">
                    <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider flex items-center gap-2">View Game <FiArrowRight size={14} aria-hidden="true" /></span>
                </div>
            </div>

            {/* Info */}
            <div className="w-full pt-[10px] px-[2px]">
                <h3 className="text-[13px] font-[700] text-white line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors duration-200" title={game.name}>
                    {game.name}
                </h3>
                {releaseYear && (
                    <div className="text-[11px] text-[#555] mt-[4px] font-medium">{releaseYear}</div>
                )}
            </div>
        </Link>
    );
};

// Named + default export for compatibility
export { GameCard };
export default GameCard;
