import React from 'react';
import { motion } from 'framer-motion';

export const GameMeter = ({ games = [], loading }) => {
    // Hardcoded mock data for the 3 cases
    const mockVerdicts = [
        {
            dominantLabel: 'MUST PLAY',
            dominantIcon: '🟢',
            dominantColor: '#2ed573',
            dominantBgColor: 'rgba(46,213,115,0.12)',
            parts: [
                { label: 'Must Play', percent: 64, color: '#2ed573' },
                { label: 'Good Enough', percent: 24, color: '#ffa502' },
                { label: 'Skip It', percent: 12, color: '#ff4757' }
            ],
            votes: '2,847'
        },
        {
            dominantLabel: 'GOOD ENOUGH',
            dominantIcon: '🟡',
            dominantColor: '#ffa502',
            dominantBgColor: 'rgba(255,165,2,0.12)',
            parts: [
                { label: 'Must Play', percent: 15, color: '#2ed573' },
                { label: 'Good Enough', percent: 55, color: '#ffa502' },
                { label: 'Skip It', percent: 30, color: '#ff4757' }
            ],
            votes: '12,490'
        },
        {
            dominantLabel: 'MASTERPIECE',
            dominantIcon: '👑',
            dominantColor: '#a855f7',
            dominantBgColor: 'rgba(168,85,247,0.12)',
            parts: [
                { label: 'Masterpiece', percent: 88, color: '#a855f7' },
                { label: 'Must Play', percent: 10, color: '#2ed573' },
                { label: 'Good Enough', percent: 2, color: '#ffa502' }
            ],
            votes: '45,210'
        }
    ];

    // We need 3 mock cards based on the first 3 games passed or just empty placeholders.
    const displayGames = games.slice(0, 3);

    return (
        <section className="w-full bg-[#0d0d0d] py-[80px]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-[48px]">
                    <span className="text-[11px] uppercase text-accent tracking-[0.25em] font-[700] mb-3">
                        THE VERDICT SYSTEM
                    </span>
                    <h2 className="font-syne text-[48px] font-[900] text-white leading-none mb-3">
                        The GameMeter™
                    </h2>
                    <p className="text-text-muted text-[16px]">
                        No star ratings. No review scores. Just the community verdict.
                    </p>
                    <div className="w-[40px] h-[2px] bg-accent mt-[16px]"></div>
                </div>

                {/* Cards Row Container */}
                <div className="flex gap-[24px] overflow-x-auto scrollbar-hide snap-x pb-4">
                    {loading ? (
                        <div className="text-text-muted w-full text-center py-10">Loading GameMeter...</div>
                    ) : (
                        displayGames.map((game, i) => {
                            const mock = mockVerdicts[i] || mockVerdicts[0];
                            const genreTag = game?.genres?.[0]?.name || 'Unknown';

                            return (
                                <div
                                    key={game.id || i}
                                    className="w-[280px] lg:w-1/3 shrink-0 snap-center bg-[#161616] border border-[#222] rounded-[12px] overflow-hidden flex flex-col"
                                >
                                    {/* Top Image */}
                                    <div className="w-full aspect-video bg-[#1a1a1a]">
                                        {game.background_image && (
                                            <img
                                                src={game.background_image}
                                                alt={game.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-[20px] flex flex-col gap-4">
                                        {/* Game Name & Genre */}
                                        <div>
                                            <h3 className="text-[18px] font-syne font-[700] text-white line-clamp-1">
                                                {game.name}
                                            </h3>
                                            <div className="inline-block bg-[#222] text-text-muted text-[11px] px-[8px] py-[2px] rounded-[4px] mt-2">
                                                {genreTag}
                                            </div>
                                        </div>

                                        {/* Dominant Verdict */}
                                        <div
                                            className="w-full rounded-[8px] p-[12px_16px] text-center"
                                            style={{ backgroundColor: mock.dominantBgColor }}
                                        >
                                            <div className="text-[24px] mb-1 leading-none">{mock.dominantIcon}</div>
                                            <div
                                                className="font-syne text-[22px] font-[900] tracking-wide"
                                                style={{ color: mock.dominantColor }}
                                            >
                                                {mock.dominantLabel}
                                            </div>
                                            <div className="text-[11px] text-text-muted uppercase tracking-wider mt-1">
                                                The community has spoken
                                            </div>
                                        </div>

                                        {/* Verdict Bar */}
                                        <div className="flex flex-col gap-[6px] mt-2">
                                            <div className="flex justify-between w-full text-[10px] text-text-muted px-1">
                                                {mock.parts.map((p, idx) => (
                                                    <span key={idx}>{p.label} {p.percent}%</span>
                                                ))}
                                            </div>
                                            <div className="w-full h-[8px] rounded-[4px] overflow-hidden flex bg-[#222]">
                                                {mock.parts.map((p, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{ width: `${p.percent}%`, backgroundColor: p.color }}
                                                        className="h-full"
                                                    ></div>
                                                ))}
                                            </div>
                                            <div className="text-[12px] text-text-muted mt-1">
                                                {mock.votes} players voted
                                            </div>
                                        </div>

                                        {/* Your Verdict Buttons */}
                                        <div className="grid grid-cols-2 gap-[8px] mt-4">
                                            {/* Must Play Button */}
                                            <button className="group relative border border-[#2ed573]/30 rounded-full px-[16px] py-[8px] text-[13px] font-[600] text-[#2ed573]/70 hover:border-[#2ed573] hover:text-[#2ed573] transition-colors overflow-hidden">
                                                <div className="absolute inset-0 bg-[#2ed573]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="relative z-10">🟢 Must Play</span>
                                            </button>

                                            {/* Good Enough Button */}
                                            <button className="group relative border border-[#ffa502]/30 rounded-full px-[16px] py-[8px] text-[13px] font-[600] text-[#ffa502]/70 hover:border-[#ffa502] hover:text-[#ffa502] transition-colors overflow-hidden">
                                                <div className="absolute inset-0 bg-[#ffa502]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="relative z-10">🟡 Good Enough</span>
                                            </button>

                                            {/* Skip It Button */}
                                            <button className="group relative border border-[#ff4757]/30 rounded-full px-[16px] py-[8px] text-[13px] font-[600] text-[#ff4757]/70 hover:border-[#ff4757] hover:text-[#ff4757] transition-colors overflow-hidden">
                                                <div className="absolute inset-0 bg-[#ff4757]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="relative z-10">🔴 Skip It</span>
                                            </button>

                                            {/* Masterpiece Button */}
                                            <button className="group relative border border-[#a855f7]/30 rounded-full px-[16px] py-[8px] text-[13px] font-[600] text-[#a855f7]/70 hover:border-[#a855f7] hover:text-[#a855f7] transition-colors overflow-hidden">
                                                <div className="absolute inset-0 bg-[#a855f7]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="relative z-10">👑 Masterpiece</span>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};
