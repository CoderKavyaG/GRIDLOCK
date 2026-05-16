import React from 'react';

export const CommunityStats = () => {
    const stats = [
        { value: "500,000+", label: "Games in our database" },
        { value: "12,000+", label: "Community verdicts cast" },
        { value: "4", label: "Verdicts. No star ratings." },
        { value: "Free", label: "Always. No paywalls." }
    ];

    return (
        <section className="w-full bg-[#0a0a0a] py-[80px] px-6 border-y border-white/5">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-wrap justify-center lg:justify-between items-start gap-12 sm:gap-16 lg:gap-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group min-w-[220px] flex-1 lg:flex-none">
                            <div className="relative mb-2">
                                <span className="font-syne text-[42px] sm:text-[52px] lg:text-[60px] xl:text-[72px] font-[900] text-accent leading-none block transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                                    {stat.value}
                                </span>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-accent group-hover:w-full transition-all duration-500 rounded-full"></div>
                            </div>
                            <p className="text-[11px] sm:text-[12px] text-[#666] group-hover:text-[#aaa] max-w-[180px] leading-relaxed font-black uppercase tracking-[0.2em] transition-colors duration-300">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


