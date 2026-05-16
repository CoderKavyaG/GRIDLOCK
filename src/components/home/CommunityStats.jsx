import React from 'react';

export const CommunityStats = () => {
    const stats = [
        { value: "500k+", label: "Games in our database" },
        { value: "12k+", label: "Community verdicts cast" },
        { value: "4", label: "Verdicts. No star ratings." },
        { value: "Free", label: "Always. No paywalls." }
    ];

    return (
        <section className="w-full bg-[#0a0a0a] py-[32px] px-2 sm:px-4 border-y border-white/5 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4 lg:gap-8 items-start">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group min-w-0">
                            <div className="relative mb-0 w-full">
                                <span className="font-syne text-[clamp(14px,3vw,40px)] font-[900] text-accent leading-none block tracking-[-0.05em] sm:tracking-tighter transition-transform duration-300 group-hover:scale-105">
                                    {stat.value}
                                </span>
                            </div>
                            <p className="text-[6px] sm:text-[8px] md:text-[10px] text-[#444] group-hover:text-[#666] w-full leading-tight font-black uppercase tracking-[0.02em] md:tracking-[0.1em] transition-colors duration-300">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};






