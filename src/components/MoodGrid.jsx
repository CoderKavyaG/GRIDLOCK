import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const BASE = "https://api.rawg.io/api";
const KEY = import.meta.env.VITE_RAWG_KEY;

const moods = [
    { id: 'story', title: 'LOST IN STORY', param: 'genres=role-playing-games-rpg', emoji: '📖', count: '4,200+' },
    { id: 'vibes', title: 'JUST VIBES', param: 'genres=indie', emoji: '🌿', count: '8,100+' },
    { id: 'action', title: 'HEART PUMPING', param: 'genres=action', emoji: '⚡', count: '12,400+' },
    { id: 'brain', title: 'BIG BRAIN', param: 'genres=strategy', emoji: '🧠', count: '3,800+' },
    { id: 'terror', title: 'TERROR MODE', param: 'tags=horror', emoji: '💀', count: '1,500+' },
    { id: 'chill', title: 'TAKE IT EASY', param: 'genres=puzzle', emoji: '🧩', count: '2,900+' },
    { id: 'feels', title: 'FEEL SOMETHING', param: 'genres=adventure', emoji: '🌄', count: '6,700+' },
    { id: 'boys', title: 'WITH THE BOYS', param: 'genres=shooter', emoji: '🎯', count: '5,300+' }
];

export const MoodGrid = () => {
    const [backgrounds, setBackgrounds] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchMoods = async () => {
            try {
                const promises = moods.map(m =>
                    axios.get(`${BASE}/games?${m.param}&ordering=-rating&page_size=1&key=${KEY}`)
                );
                const results = await Promise.all(promises);

                if (isMounted) {
                    const bgMap = {};
                    results.forEach((res, i) => {
                        const game = res.data.results?.[0];
                        bgMap[moods[i].id] = game?.background_image || '';
                    });
                    setBackgrounds(bgMap);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load mood backgrounds", err);
                if (isMounted) setLoading(false);
            }
        };

        fetchMoods();

        return () => { isMounted = false; };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.97 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <section className="w-full bg-[#0d0d0d] py-[80px]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="mb-[48px]">
                    <span className="text-[11px] uppercase text-accent tracking-[0.2em] font-[700] mb-3 block">
                        FIND YOUR NEXT GAME
                    </span>
                    <h2 className="font-syne text-[48px] font-[900] text-white leading-none mb-3">
                        What's Your Mood?
                    </h2>
                    <p className="text-text-muted text-[16px]">
                        Pick a vibe. We'll find your next obsession.
                    </p>
                </div>

                {/* Grid */}
                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] w-full"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {moods.map((mood) => {
                        const bgImage = backgrounds[mood.id];

                        return (
                            <motion.div
                                key={mood.id}
                                variants={itemVariants}
                                className="group relative w-full h-[220px] overflow-hidden cursor-pointer"
                            >
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-[#1a1a1a] transition-transform duration-400 ease-in-out group-hover:scale-[1.04]"
                                >
                                    {bgImage ? (
                                        <img
                                            src={bgImage}
                                            alt={mood.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {loading ? <span className="text-[#333]">...</span> : <span className="text-2xl text-[#333]">🎮</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Overlays */}
                                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/35 transition-colors duration-400 z-[1]"></div>

                                {/* Bottom Border on Hover */}
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-[5]"></div>

                                {/* Content */}
                                <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center p-4">
                                    <span className="text-[32px] mb-2">{mood.emoji}</span>
                                    <h3 className="font-syne text-[18px] font-[800] text-white/90 group-hover:text-white uppercase tracking-[0.05em] text-center transition-colors duration-400">
                                        {mood.title}
                                    </h3>
                                    <span className="text-[11px] text-white/50 mt-1">
                                        {mood.count} games
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
