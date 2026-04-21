import React from 'react';
import { motion } from 'framer-motion';
import { GameCard } from './GameCard';
import { SkeletonCard } from './SkeletonCard';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export const GameRow = ({ title, chipLabel, chipColor, games, loading, error, seeAllHref, showRank = false }) => {
    // Determine text color for chip based on background
    // Simple check: if background is very light, use black text, otherwise white.
    // We'll hardcode to the design specs: white/accent means black text, else white.
    const isLightChip = chipColor === '#ffffff' || chipColor === '#e8ff47' || chipColor === 'var(--accent)' || chipColor === 'white';
    const textColor = isLightChip ? 'text-black' : 'text-white';

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 12 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-[80px]">
            {/* Header */}
            <div className="flex justify-between items-end mb-[24px]">
                <div className="flex flex-col gap-2">
                    {chipLabel && (
                        <span
                            className={`text-[10px] uppercase tracking-[0.15em] rounded-[4px] px-[10px] py-[3px] font-[700] w-max ${textColor}`}
                            style={{ backgroundColor: chipColor }}
                        >
                            {chipLabel}
                        </span>
                    )}
                    <h2 className="font-syne text-[28px] font-[800] text-white leading-none">
                        {title}
                    </h2>
                </div>

                {seeAllHref && (
                    <Link to={seeAllHref} className="text-[13px] text-text-muted hover:text-white transition-colors duration-150 whitespace-nowrap mb-1 flex items-center gap-1.5">
                        See All <FiArrowRight size={14} aria-hidden="true" />
                    </Link>
                )}
            </div>

            {/* Row Content */}
            {error ? (
                <div className="text-[14px] text-text-muted">Unable to load games.</div>
            ) : (
                <motion.div
                    className="flex gap-[16px] overflow-x-auto scrollbar-hide pb-[8px]"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))
                    ) : (games && Array.isArray(games) && games.length > 0) ? (
                        games.map((game, i) => (
                            <motion.div key={game.id} variants={itemVariants}>
                                <GameCard game={game} rank={showRank ? i + 1 : undefined} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-[14px] text-text-muted">No games to display.</div>
                    )}
                </motion.div>
            )}
        </div>
    );
};
