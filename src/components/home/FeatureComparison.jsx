import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export const FeatureComparison = () => {
    const rows = [
        { label: "Rating system", gridlock: "Verdict system (Must Play etc)", other1: "1-5 stars", other2: "Critic scores" },
        { label: "Who decides?", gridlock: "The community", other1: "Anyone", other2: "Paid critics" },
        { label: "Debate system", gridlock: true, other1: false, other2: false },
        { label: "Game shelf tracker", gridlock: true, other1: "Basic", other2: false },
        { label: "No ads", gridlock: "Free forever", other1: "Varies", other2: "Ad-heavy" },
        { label: "Community verdicts", gridlock: "GameMeter™", other1: false, other2: false },
        { label: "Collections / Lists", gridlock: true, other1: "Basic", other2: false },
        { label: "Indian community", gridlock: "Growing", other1: false, other2: false },
    ];

    const renderCell = (val, isHighlight = false) => {
        if (val === true) return <FaCheck className="text-[var(--accent-green)] text-[18px]" />;
        if (val === false) return <FaTimes className="text-[#444] text-[18px]" />;
        return <span className={`${isHighlight ? 'text-white font-bold' : 'text-[#777]'}`}>{val}</span>;
    };

    return (
        <section className="w-full bg-[#0a0a0a] py-[100px] px-4 md:px-8">
            <div className="max-w-[1000px] mx-auto text-center">
                <h2 className="font-syne text-[36px] md:text-[48px] font-black text-white mb-12 tracking-tight">
                    Why not just use <span className="text-[var(--accent)]">Metacritic?</span>
                </h2>

                <div className="rounded-[24px] overflow-hidden border border-[#1e1e1e] shadow-2xl">
                    {/* Header */}
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] bg-[#161616]">
                        <div className="p-6 text-left text-[11px] font-bold text-[#555] uppercase tracking-widest border-r border-b border-[#222]">Feature</div>
                        <div className="p-6 text-center text-[12px] font-black text-[#555] uppercase tracking-widest border-r border-b border-[#222]">Metacritic / IGN</div>
                        <div className="p-6 text-center text-[13px] font-[900] text-black uppercase tracking-[0.15em] bg-[var(--accent)] border-b border-[var(--accent)]">GRIDLOCK</div>
                        <div className="p-6 text-center text-[12px] font-black text-[#555] uppercase tracking-widest border-b border-[#222]">Star Rating Sites</div>
                    </div>

                    {/* Body */}
                    {rows.map((row, idx) => (
                        <div 
                            key={idx} 
                            className={`grid grid-cols-[1.5fr_1fr_1fr_1fr] ${idx % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}
                        >
                            <div className="p-5 text-left text-[14px] font-bold text-[#999] border-r border-[#1e1e1e]">{row.label}</div>
                            <div className="p-5 flex items-center justify-center text-[13px] font-medium border-r border-[#1e1e1e]">{renderCell(row.other2)}</div>
                            <div className="p-5 flex items-center justify-center text-[14px] font-bold bg-[#ffffff03] border-r border-[#1e1e1e]">{renderCell(row.gridlock, true)}</div>
                            <div className="p-5 flex items-center justify-center text-[13px] font-medium">{renderCell(row.other1)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
