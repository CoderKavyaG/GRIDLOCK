import React from 'react';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FiMonitor } from 'react-icons/fi';
import { BsBookmarkPlusFill } from 'react-icons/bs';

export const GameCard = ({ game, rank }) => {
    const hasPlatforms = game?.platforms && game.platforms.length > 0;

    return (
        <div className="group w-[180px] shrink-0 cursor-pointer flex flex-col">
            {/* Outer wrapper */}
            <div className="relative w-full aspect-[3/4] rounded-[8px] overflow-hidden border border-[#222] transition-colors duration-200 group-hover:border-[#3a3a3a]">

                {/* Image Container */}
                {game?.background_image ? (
                    <img
                        src={game.background_image}
                        alt={game.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center absolute inset-0">
                        <IoGameControllerOutline size={32} className="text-[#333]" />
                    </div>
                )}

                {/* Rank Badge */}
                {rank !== undefined && (
                    <div className="absolute top-[8px] left-[8px] bg-black/75 backdrop-blur-[4px] rounded-[4px] px-[8px] py-[2px] font-syne text-[13px] font-[700] text-accent z-10">
                        #{rank.toString().padStart(2, '0')}
                    </div>
                )}

                {/* Metacritic Badge for Top Rated section */}
                {game?.metacritic && !rank && (
                    <div className={`absolute top-0 right-0 font-syne font-[900] text-[14px] px-[8px] py-[6px] rounded-bl-[4px] z-10 text-white
            ${game.metacritic >= 90 ? 'bg-[#2ed573] text-black' : game.metacritic >= 75 ? 'bg-[#ffa502] text-black' : 'bg-[#ff4757] text-white'}`}>
                        {game.metacritic}
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-[1]"></div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-[5]">
                    <button className="flex items-center gap-[6px] bg-accent text-black font-[700] text-[12px] rounded-[6px] px-[16px] py-[8px] hover:brightness-110 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <BsBookmarkPlusFill size={14} /> Backlog
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="w-full pt-[10px]">
                <h3 className="text-[13px] font-[600] text-white line-clamp-2 leading-snug" title={game?.name}>
                    {game?.name}
                </h3>

                {/* Platform Icons */}
                <div className="flex items-center gap-[4px] text-[12px] text-[#555] mt-[4px]">
                    <IoGameControllerOutline size={12} />
                    {hasPlatforms && <FiMonitor size={12} />}
                </div>

                {/* Mock verdict chip */}
                <div className="mt-2 inline-flex items-center bg-[#2ed573]/10 text-[#2ed573] text-[10px] font-[700] px-[8px] py-[2px] rounded-full uppercase tracking-wider border border-[#2ed573]/20">
                    Must Play
                </div>

                {/* Fallback for New Releases specific data */}
                {game?.released && !game?.metacritic && !rank && (
                    <div className="mt-1 text-[11px] text-text-muted">
                        {(() => {
                            const diffTime = Math.abs(new Date() - new Date(game.released));
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return `${diffDays} days ago`;
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};
