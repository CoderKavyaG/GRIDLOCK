import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiBook, FiFeather, FiZap, FiCpu, FiMoon, FiGrid, FiCompass, FiTarget } from 'react-icons/fi';
import { BiJoystick } from 'react-icons/bi';

const BASE = "https://api.rawg.io/api";
const KEY = import.meta.env.VITE_RAWG_KEY;

const moods = [
    { id: 'story', title: 'LOST IN STORY', param: 'genres=role-playing-games-rpg', icon: FiBook, count: '4,200+', fallback: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
    { id: 'vibes', title: 'JUST VIBES', param: 'genres=indie', icon: FiFeather, count: '8,100+', fallback: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800' },
    { id: 'action', title: 'HEART PUMPING', param: 'genres=action', icon: FiZap, count: '12,400+', fallback: 'https://images.unsplash.com/photo-1552824236-07764a8391d2?auto=format&fit=crop&q=80&w=800' },
    { id: 'brain', title: 'BIG BRAIN', param: 'genres=strategy', icon: FiCpu, count: '3,800+', fallback: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=800' },
    { id: 'terror', title: 'TERROR MODE', param: 'tags=horror', icon: FiMoon, count: '1,500+', fallback: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800' },
    { id: 'chill', title: 'TAKE IT EASY', param: 'genres=puzzle', icon: FiGrid, count: '2,900+', fallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
    { id: 'feels', title: 'FEEL SOMETHING', param: 'genres=adventure', icon: FiCompass, count: '6,700+', fallback: 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?auto=format&fit=crop&q=80&w=800' },
    { id: 'boys', title: 'WITH THE BOYS', param: 'genres=shooter', icon: FiTarget, count: '5,300+', fallback: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' }
];


export const MoodGrid = () => {
    const [backgrounds, setBackgrounds] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchMoods = async () => {
            try {
                // Initial delay to let main page requests finish
                await new Promise(resolve => setTimeout(resolve, 500));

                if (!KEY) {
                    throw new Error("API Key is missing from environment variables");
                }

                const bgMap = {};
                // Stagger requests to avoid connection resets/rate limits
                for (let i = 0; i < moods.length; i++) {
                    if (!isMounted) break;
                    const m = moods[i];
                    try {
                        const res = await axios.get(`${BASE}/games?${m.param}&ordering=-rating&page_size=1&key=${KEY}`);
                        const game = res.data.results?.[0];
                        bgMap[m.id] = game?.background_image || '';
                    } catch (e) {
                        console.warn(`Failed to fetch for mood ${m.id}`, e.message);
                        bgMap[m.id] = '';
                    }
                    // Wait 150ms between requests (slightly longer to be safe)
                    if (i < moods.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 150));
                    }
                }

                if (isMounted) {
                    setBackgrounds(bgMap);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Critical error in MoodGrid:", err.message);
                if (isMounted) setLoading(false);
            }
        };

        fetchMoods();

        return () => { isMounted = false; };
    }, []);

    if (!loading && Object.keys(backgrounds).length === 0) {
        return (
            <div className="w-full py-16 bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h3 className="text-2xl font-bold text-white mb-2">Explore by Mood</h3>
                    <p className="text-[#888] mb-6">Unable to load mood categories. Please refresh the page.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[var(--accent)] text-black font-bold rounded-full hover:brightness-110 transition-all">Refresh</button>
                </div>
            </div>
        );
    }

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
                                    {(bgImage || mood.fallback) ? (
                                        <img
                                            src={bgImage || mood.fallback}
                                            alt={mood.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {loading ? <span className="text-[#333]">...</span> : <BiJoystick size={32} className="text-[#333]" aria-hidden="true" />}
                                        </div>
                                    )}
                                </div>


                                {/* Overlays */}
                                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/35 transition-colors duration-400 z-[1]"></div>

                                {/* Bottom Border on Hover */}
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-[5]"></div>

                                {/* Content */}
                                <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center p-4">
                                    <mood.icon size={32} className="mb-2 text-white/90" aria-hidden="true" />
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
