import React from 'react';
import { FaXTwitter, FaInstagram, FaDiscord, FaYoutube } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="w-full bg-[#080808] border-t border-[#181818] pt-[72px] pb-[32px]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[48px] lg:gap-[32px]">

                    {/* Column 1 - Brand */}
                    <div className="flex flex-col">
                        <Link to="/" className="flex flex-col select-none mb-4">
                            <div className="font-syne text-[20px] font-[800] text-white flex items-center leading-none">
                                GRIDLOCK<span className="text-accent ml-1">.</span>
                            </div>
                            <span className="text-text-muted text-[13px] mt-[4px] leading-none">
                                Find Games That Matter
                            </span>
                        </Link>
                        <p className="text-[14px] text-text-muted leading-relaxed mb-6 max-w-[280px]">
                            A community-first gaming platform. Discover, rate, and debate games with people who actually care.
                        </p>
                        <div className="flex items-center gap-[16px]">
                            <a href="#" aria-label="Twitter" className="text-text-muted hover:text-white transition-colors text-[18px]">
                                <FaXTwitter />
                            </a>
                            <a href="#" aria-label="Instagram" className="text-text-muted hover:text-white transition-colors text-[18px]">
                                <FaInstagram />
                            </a>
                            <a href="#" aria-label="Discord" className="text-text-muted hover:text-white transition-colors text-[18px]">
                                <FaDiscord />
                            </a>
                            <a href="#" aria-label="YouTube" className="text-text-muted hover:text-white transition-colors text-[18px]">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 - Discover */}
                    <div className="flex flex-col">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-[16px] font-[600]">
                            DISCOVER
                        </h4>
                        <div className="flex flex-col gap-[10px]">
                            {['Trending', 'New Releases', 'Top Rated', 'By Genre', 'By Platform', 'Random Game'].map((link) => (
                                <Link key={link} to="#" className="text-[14px] text-text-muted hover:text-white transition-colors inline-block w-fit">
                                    {link}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 3 - Community */}
                    <div className="flex flex-col">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-[16px] font-[600]">
                            COMMUNITY
                        </h4>
                        <div className="flex flex-col gap-[10px]">
                            {['Reviews', 'Hot Debates', 'Collections'].map((link) => (
                                <Link key={link} to="#" className="text-[14px] text-text-muted hover:text-white transition-colors inline-block w-fit">
                                    {link}
                                </Link>
                            ))}
                            <Link to="/leaderboard" className="text-[14px] text-text-muted hover:text-white transition-colors inline-block w-fit">
                                Leaderboard
                            </Link>
                            <Link to="/guidelines" className="text-[14px] text-text-muted hover:text-white transition-colors inline-block w-fit">
                                Guidelines
                            </Link>
                            <Link to="#" className="text-[14px] text-text-muted hover:text-white transition-colors inline-block w-fit">
                                Discord Server
                            </Link>
                        </div>
                    </div>

                    {/* Column 4 - About */}
                    <div className="flex flex-col">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-[16px] font-[600]">
                            GRIDLOCK
                        </h4>
                        <div className="flex flex-col gap-[10px]">
                            {['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'].map((link) => (
                                <Link key={link} to="#" className="text-[14px] text-text-muted hover:text-white transition-colors inline-block w-fit">
                                    {link}
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#181818] mt-[48px] mb-[20px]"></div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[#444]">
                    <p>© 2025 Gridlock. All rights reserved.</p>
                    <p>Game data powered by RAWG.io</p>
                </div>

            </div>
        </footer>
    );
};
