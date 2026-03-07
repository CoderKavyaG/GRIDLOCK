import React from 'react';
import { motion } from 'framer-motion';

const debates = [
    {
        id: 1,
        game: 'Elden Ring',
        thumb: 'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efdf5ac682e022.jpg',
        statement: "Elden Ring is overrated and the fanbase won't admit it.",
        agree: 42,
        disagree: 58,
        avatars: [1, 2, 3, 4],
        joined: '248',
        reactions: { fire: '1.2k', chat: '340', repost: '89' }
    },
    {
        id: 2,
        game: 'Red Dead Redemption 2',
        thumb: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
        statement: "Red Dead Redemption 2 has better storytelling than 90% of movies.",
        agree: 81,
        disagree: 19,
        avatars: [5, 6, 7, 8],
        joined: '1,402',
        reactions: { fire: '5.4k', chat: '1.2k', repost: '430' }
    },
    {
        id: 3,
        game: 'Grand Theft Auto V',
        thumb: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg',
        statement: "The GTA V hype has lasted longer than it deserves.",
        agree: 55,
        disagree: 45,
        avatars: [9, 10, 11, 12],
        joined: '890',
        reactions: { fire: '3.1k', chat: '892', repost: '210' }
    }
];

export const DebateCards = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="w-full bg-[#111] py-[80px]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="mb-[48px]">
                    <span className="inline-block bg-[#ff4757] text-white text-[10px] uppercase tracking-[0.15em] font-[700] px-[10px] py-[3px] rounded-[4px] mb-4">
                        HOT RIGHT NOW
                    </span>
                    <h2 className="font-syne text-[40px] font-[800] text-white leading-tight mb-2">
                        The Community Has Opinions 🔥
                    </h2>
                    <p className="text-text-muted text-[16px]">
                        Real takes. No filters. Join the debate.
                    </p>
                </div>

                {/* Debate Cards */}
                <motion.div
                    className="flex flex-col lg:flex-row gap-[20px]"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {debates.map((debate) => (
                        <motion.div
                            key={debate.id}
                            variants={itemVariants}
                            className="flex-1 bg-[#161616] border border-[#222] rounded-[12px] p-[24px] flex flex-col"
                        >
                            {/* Top Row */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={debate.thumb}
                                        alt={debate.game}
                                        className="w-[56px] h-[72px] object-cover rounded-[4px]"
                                        loading="lazy"
                                    />
                                    <span className="text-[12px] text-text-muted font-[500] max-w-[100px] line-clamp-2 leading-tight">
                                        {debate.game}
                                    </span>
                                </div>
                                <div className="bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-[10px] font-[700] px-[8px] py-[2px] rounded-full">
                                    🔥 HOT
                                </div>
                            </div>

                            {/* Statement */}
                            <h3 className="font-syne text-[17px] font-[700] text-white leading-[1.4] my-[16px]">
                                "{debate.statement}"
                            </h3>

                            {/* Verdict Split Bar */}
                            <div className="flex flex-col gap-1 mb-[20px]">
                                <div className="flex justify-between text-[10px] font-[600] tracking-wider mb-1 text-text-muted">
                                    <span className="text-[#2ed573]">AGREE {debate.agree}%</span>
                                    <span className="text-[#ff4757]">DISAGREE {debate.disagree}%</span>
                                </div>
                                <div className="w-full h-[6px] rounded-full overflow-hidden flex bg-[#333]">
                                    <div style={{ width: `${debate.agree}%` }} className="bg-[#2ed573] h-full"></div>
                                    <div style={{ width: `${debate.disagree}%` }} className="bg-[#ff4757] h-full"></div>
                                </div>
                            </div>

                            {/* Avatars */}
                            <div className="flex items-center mt-auto mb-[20px]">
                                <div className="flex">
                                    {debate.avatars.map((avatarId, i) => (
                                        <img
                                            key={avatarId}
                                            src={`https://i.pravatar.cc/32?img=${avatarId}`}
                                            alt="User avatar"
                                            className={`w-[28px] h-[28px] rounded-full border-2 border-[#161616] ${i !== 0 ? '-ml-[8px]' : ''}`}
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                                <span className="text-[12px] text-text-muted ml-3">
                                    + {debate.joined} joined
                                </span>
                            </div>

                            {/* Reactions & CTA */}
                            <div className="flex items-center justify-between pt-[16px] border-t border-[#222]">
                                <div className="flex gap-[12px] text-[12px] text-text-muted">
                                    <span>🔥 {debate.reactions.fire}</span>
                                    <span>💬 {debate.reactions.chat}</span>
                                    <span>🔁 {debate.reactions.repost}</span>
                                </div>
                                <button className="text-[13px] text-accent font-[600] hover:underline transition-all">
                                    Join Debate &rarr;
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
