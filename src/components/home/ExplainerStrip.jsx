import React from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { FiSearch, FiTrendingUp, FiBarChart2, FiMessageSquare } from 'react-icons/fi';

export const ExplainerStrip = () => {
    const steps = [
        { icon: FiSearch, title: "Find a game", desc: "Search through 500k+ titles" },
        { icon: FiMessageSquare, title: "Cast your verdict", desc: "Must Play, Good Enough..." },
        { icon: FiBarChart2, title: "See consensus", desc: "Live community GameMeter" },
        { icon: FiTrendingUp, title: "Debate it", desc: "Discuss hot takes with players" }
    ];

    return (
        <section className="w-full bg-[#0d0d0d] border-y border-[#1a1a1a] py-12 px-6">
            <div className="max-w-[1200px] mx-auto">
                <h4 className="text-center font-syne text-[14px] font-bold text-[#555] uppercase tracking-[0.2em] mb-10">
                    How does the GameMeter™ work?
                </h4>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                        <React.Fragment key={idx}>
                            <div className="flex flex-col items-center text-center group">
                                <div className="text-[40px] mb-4 transition-transform duration-300 group-hover:scale-110 text-[var(--accent)]">
                                    <Icon size={40} />
                                </div>
                                <h5 className="text-[14px] font-black text-white uppercase tracking-wider mb-2">
                                    {step.title}
                                </h5>
                                <p className="text-[12px] text-[#666] max-w-[160px] font-medium leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                            {idx < steps.length - 1 && (
                                <FaChevronRight className="hidden md:block text-[#222] text-[20px]" />
                            )}
                        </React.Fragment>
                    );
                    })}
                </div>
            </div>
        </section>
    );
};
