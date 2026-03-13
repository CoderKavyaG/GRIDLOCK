import React from 'react';

export const CommunityStats = () => {
    const stats = [
        { value: "500,000+", label: "Games in our database" },
        { value: "12,000+", label: "Community verdicts cast" },
        { value: "4", label: "Verdicts. No star ratings." },
        { value: "Free", label: "Always. No paywalls." }
    ];

    return (
        <section className="w-full bg-[#111] py-[72px] px-6">
            <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                        <span className="font-syne text-[48px] md:text-[64px] font-[900] text-[var(--accent)] leading-none mb-3">
                            {stat.value}
                        </span>
                        <p className="text-[14px] text-[#777] max-w-[160px] leading-snug font-medium uppercase tracking-wider">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};
