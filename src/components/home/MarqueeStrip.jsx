import React from 'react';

const marqueeItems = [
    { verdict: "Must Play", game: "Elden Ring", votes: "12,847", color: "var(--accent-green)" },
    { verdict: "Masterpiece", game: "Red Dead Redemption 2", votes: "8,291", color: "var(--accent-purple)" },
    { verdict: "Skip It", game: "Starfield", votes: "4,502", color: "var(--accent-red)" },
    { verdict: "Good Enough", game: "Spider-Man 2", votes: "6,102", color: "var(--accent-yellow)" },
    { verdict: "Must Play", game: "The Last of Us Part II", votes: "15,321", color: "var(--accent-green)" },
    { verdict: "Masterpiece", game: "The Witcher 3", votes: "22,143", color: "var(--accent-purple)" },
    { verdict: "Skip It", game: "Gollum", votes: "1,200", color: "var(--accent-red)" },
    { verdict: "Good Enough", game: "Halo Infinite", votes: "9,431", color: "var(--accent-yellow)" },
];

export const MarqueeStrip = () => {
    return (
        <div className="w-full bg-[#111] border-y border-[#222] py-4 overflow-hidden relative select-none">
            <div className="flex whitespace-nowrap animate-marquee">
                {/* Double the items for seamless loop */}
                {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                    <div key={idx} className="flex items-center mx-12">
                        <span 
                            className="w-2 h-2 rounded-full mr-4" 
                            style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                            {item.verdict}
                        </span>
                        <span className="mx-3 text-[#444] font-light">·</span>
                        <span className="text-[13px] text-[#ccc] font-medium">
                            {item.game}
                        </span>
                        <span className="mx-3 text-[#444] font-light">·</span>
                        <span className="text-[11px] text-[#777] font-bold uppercase tracking-[0.1em]">
                            {item.votes} VOTES
                        </span>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
            `}} />
        </div>
    );
};
