import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rawg } from '../api/rawg';
import { useGames } from '../hooks/useGames';
import { FiStar, FiCalendar, FiMonitor, FiArrowRight, FiPlus } from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { HiHandThumbUp, HiMinus, HiHandThumbDown } from 'react-icons/hi2';
import { BiTrendingUp } from 'react-icons/bi';
import { Link } from 'react-router-dom';

export const Hero = () => {
    const { data: games, loading, error } = useGames(rawg.heroGames);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 6 seconds
    useEffect(() => {
        if (!games || games.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % games.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [games]);

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-text-muted font-inter">Preparing your feed...</div>
            </div>
        );
    }

    if (error || !games || games.length === 0) {
        return (
            <div className="w-full h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <div className="text-accent-red font-syne text-[24px] font-bold">Failed to load games</div>
                <div className="text-text-muted mt-2">{error || "No games found"}</div>
            </div>
        );
    }

    const activeGame = games[currentIndex];

    const getYear = (dateStr) => {
        return dateStr ? new Date(dateStr).getFullYear() : 'N/A';
    };

    const getGenres = (genres) => {
        return genres && genres.length > 0 ? genres[0].name : 'Unknown';
    };

    const getPlatforms = (platforms) => {
        if (!platforms) return '';
        return platforms
            .slice(0, 3)
            .map((p) => p.platform.name)
            .join(', ');
    };

    // Mock verdict data
    const verdictMocks = [
        { label: 'Must Play', percent: 67, colorClass: 'text-[#2ed573]', bgClass: 'bg-[#2ed573]/10 border-[#2ed573]/30', icon: HiHandThumbUp },
        { label: 'Good Enough', percent: 22, colorClass: 'text-[#ffa502]', bgClass: 'bg-[#ffa502]/10 border-[#ffa502]/30', icon: HiMinus },
        { label: 'Skip It', percent: 11, colorClass: 'text-[#ff4757]', bgClass: 'bg-[#ff4757]/10 border-[#ffa502]/30', icon: HiHandThumbDown }
    ];

    const textVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" }
        }
    };

    const ctaVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut", delay: 0.1 }
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
            {/* Background Images */}
            <AnimatePresence mode="wait">
                <motion.img
                    key={activeGame.id}
                    src={activeGame.background_image}
                    alt={activeGame.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
            </AnimatePresence>

            {/* Layer 1: Dark Overlay */}
            <div className="absolute inset-0 bg-black/45 z-[1]"></div>

            {/* Layer 2: Gradient from Left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 from-[35%] via-[#0a0a0a]/20 to-transparent z-[2]"></div>

            {/* Layer 3: Gradient from Bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-[3]"></div>

            {/* Layer 4: Gradient from Top (New - for Navbar visibility) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent h-[160px] z-[4]"></div>

            {/* Content Container */}
            <div className="absolute top-0 left-0 w-full h-full z-[10] px-4 lg:px-8 flex items-end">
                <div className="max-w-[1400px] w-full mx-auto pb-[8%] lg:pb-[10%] pt-[100px] flex flex-col lg:flex-row items-end">

                    {/* Left Column (55%) */}
                    <div className="w-full lg:w-[55%] flex flex-col gap-5 lg:gap-6">
                        {/* Eyebrow Label */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            key={`eyebrow-${activeGame.id}`}
                            className="inline-flex max-w-max items-center justify-center px-3 py-1 bg-[#e8ff47]/10 border border-[#e8ff47]/30 rounded-full text-accent text-[11px] uppercase tracking-[0.2em] font-bold"
                        >
                            <BiTrendingUp size={14} className="mr-2" aria-hidden="true" /> TRENDING THIS WEEK
                        </motion.div>

                        {/* Game Title */}
                        <motion.h1
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            key={`title-${activeGame.id}`}
                            className="font-syne font-[900] text-white text-[32px] lg:text-[clamp(40px,6vw,84px)] leading-[1.0] drop-shadow-2xl max-w-[800px]"
                            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.7)" }}
                        >
                            {activeGame.name}
                        </motion.h1>

                        {/* Meta Row */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            key={`meta-${activeGame.id}`}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <div className="flex items-center gap-[6px] bg-white/10 border border-white/10 rounded-[4px] px-[10px] py-[4px] text-[12px] text-text-muted">
                                <FiStar className="text-accent" /> {activeGame.rating}/5
                            </div>
                            <div className="flex items-center gap-[6px] bg-white/10 border border-white/10 rounded-[4px] px-[10px] py-[4px] text-[12px] text-text-muted">
                                <IoGameControllerOutline /> {getGenres(activeGame.genres)}
                            </div>
                            <div className="flex items-center gap-[6px] bg-white/10 border border-white/10 rounded-[4px] px-[10px] py-[4px] text-[12px] text-text-muted">
                                <FiCalendar /> {getYear(activeGame.released)}
                            </div>
                            <div className="flex items-center gap-[6px] bg-white/10 border border-white/10 rounded-[4px] px-[10px] py-[4px] text-[12px] text-text-muted">
                                <FiMonitor /> {getPlatforms(activeGame.platforms)}
                            </div>
                        </motion.div>

                        {/* Verdict Row */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            key={`verdict-${activeGame.id}`}
                            className="flex flex-col gap-2"
                        >
                            <span className="text-[11px] uppercase text-text-muted tracking-[0.1em]">Community says:</span>
                            <div className="flex flex-wrap items-center gap-3">
                                {verdictMocks.map((v, i) => (
                                    <div key={i} className={`flex items-center gap-1.5 ${v.bgClass} border rounded-full px-3 py-1 ${v.colorClass} text-[12px] font-[600]`}>
                                        <v.icon size={14} aria-hidden="true" /> {v.percent}% {v.label}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={ctaVariants}
                            key={`cta-${activeGame.id}`}
                            className="flex flex-row items-center gap-3 mt-2"
                        >
                            <Link
                                to={`/game/${activeGame.id}`}
                                className="bg-accent text-black font-[700] text-[15px] px-[32px] py-[14px] rounded-[8px] hover:brightness-105 hover:-translate-y-[1px] transition-all flex items-center gap-2"
                            >
                                View Details <FiArrowRight size={18} aria-hidden="true" />
                            </Link>
                            <button className="bg-transparent border border-white/25 text-white font-[700] text-[15px] px-[32px] py-[14px] rounded-[8px] hover:bg-white/10 hover:border-white/50 transition-all flex items-center gap-2">
                                <FiPlus size={18} aria-hidden="true" /> Add to Shelf
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column (45%) - Cover Card */}
                    <div className="hidden lg:flex w-[45%] justify-center items-end pb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`card-${activeGame.id}`}
                                initial={{ opacity: 0, rotate: 0, y: 20 }}
                                animate={{ opacity: 1, rotate: -2, y: 0 }}
                                exit={{ opacity: 0, rotate: -4, y: 20 }}
                                transition={{ duration: 0.6 }}
                                className="relative w-[220px] bg-white p-[6px] pb-0 rounded-[4px] shadow-2xl origin-bottom"
                            >
                                {/* Image */}
                                <div className="w-full aspect-[3/4] relative rounded-[2px] overflow-hidden">
                                    <img
                                        src={activeGame.background_image}
                                        alt={activeGame.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Metacritic Badge */}
                                    {activeGame.metacritic && (
                                        <div className="absolute top-0 right-0 bg-accent text-black font-syne font-[900] text-[14px] px-[8px] py-[6px] rounded-bl-[4px]">
                                            {activeGame.metacritic}
                                        </div>
                                    )}
                                </div>

                                {/* White Strip below image */}
                                <div className="w-full h-[40px] bg-white flex flex-col justify-center items-center">
                                    <span className="text-black font-syne font-[600] text-[11px] uppercase tracking-wide truncate w-[90%] text-center">
                                        {activeGame.name}
                                    </span>
                                    {/* Platform Icons Mini Row (mock dots for now) */}
                                    <div className="flex gap-[6px] mt-[2px] text-[#888] text-[10px]">
                                        <IoGameControllerOutline size={12} />
                                        <FiMonitor size={12} />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 flex items-center gap-3 z-[10]">
                {games.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${currentIndex === i ? 'bg-accent w-[24px]' : 'bg-white/30 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
