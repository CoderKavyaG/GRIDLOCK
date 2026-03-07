import React from 'react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: '🎯',
        title: 'The GameMeter™',
        body: 'Vote with verdicts. Must Play, Good Enough, Skip It, Masterpiece. The community decides — not critics.'
    },
    {
        icon: '📚',
        title: 'Your Game Shelf',
        body: "Track every game you've played, abandoned, or are afraid to finish. No judgment. (Okay, a little judgment.)"
    },
    {
        icon: '🔥',
        title: 'Hot Debates',
        body: 'Argue about whether Cyberpunk redeemed itself. Whether Elden Ring is overrated. It\'s basically therapy.'
    },
    {
        icon: '🎲',
        title: 'Mood Discovery',
        body: "Don't know what to play? Pick your vibe. We'll find your next obsession from 500,000+ games."
    }
];

export const FeaturesSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="w-full bg-[#0a0a0a] py-[80px]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-[48px]">
                    <h2 className="font-syne text-[48px] font-[900] text-white leading-none mb-4">
                        Built for Real Gamers
                    </h2>
                    <p className="text-text-muted text-[16px]">
                        Not another review aggregator. A community that actually plays.
                    </p>
                </div>

                {/* Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px]"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="bg-[#111] border border-[#1e1e1e] border-t-2 border-t-transparent hover:border-[#333] hover:border-t-accent rounded-[12px] p-[32px_24px] transition-colors duration-300 group"
                        >
                            <div className="text-[36px] mb-4 group-hover:scale-110 transition-transform origin-left">
                                {feature.icon}
                            </div>
                            <h3 className="font-syne text-[18px] font-[700] text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="font-inter text-[14px] text-text-muted leading-relaxed">
                                {feature.body}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};
