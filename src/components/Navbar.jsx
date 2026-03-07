import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Discover', path: '/' },
        { name: 'Browse', path: '/browse' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Collections', path: '/collections' },
        { name: 'Debates', path: '/debates' }
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSearchOpen(false);
        };
        if (searchOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen]);

    // Lock scroll when overlays are open
    useEffect(() => {
        if (searchOpen || mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [searchOpen, mobileMenuOpen]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full h-[64px] z-[100] transition-all duration-300 ease-in-out ${scrolled
                        ? 'bg-[#0a0a0a]/90 backdrop-blur-[16px] border-b border-[#1e1e1e]'
                        : 'bg-transparent border-b border-transparent'
                    }`}
            >
                <div className="max-w-[1400px] h-full mx-auto px-4 lg:px-8 flex items-center justify-between">
                    {/* Left Side: Brand */}
                    <Link to="/" className="flex flex-col select-none">
                        <div className="font-syne text-[22px] font-[800] text-white flex items-center leading-none">
                            GRIDLOCK<span className="text-accent ml-1">.</span>
                        </div>
                        <span className="text-text-muted text-[10px] tracking-[0.15em] uppercase font-inter mt-[4px] leading-none">
                            Find Games That Matter
                        </span>
                    </Link>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`font-inter text-[14px] font-[500] transition-colors duration-150 ${isActive ? 'text-accent' : 'text-text-muted hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side: Search & CTA & Mobile Toggle */}
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-text-muted hover:text-white transition-colors"
                            aria-label="Search"
                        >
                            <FiSearch size={20} />
                        </button>

                        <div className="hidden lg:flex items-center gap-5">
                            <div className="w-[1px] h-[20px] bg-[#2a2a2a]"></div>
                            <button className="text-[13px] font-inter text-text-muted hover:text-white transition-colors">
                                Sign In
                            </button>
                            <button className="text-[13px] font-inter font-[700] bg-accent text-black rounded-[6px] px-[18px] py-[8px] hover:brightness-110 transition-all">
                                Join Free
                            </button>
                        </div>

                        <button
                            className="lg:hidden text-text-muted hover:text-white transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <FiMenu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[110] bg-black/95 flex flex-col justify-center items-center px-6"
                    >
                        <button
                            className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors"
                            onClick={() => setSearchOpen(false)}
                        >
                            <FiX size={32} />
                        </button>
                        <div className="w-full max-w-3xl relative">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={28} />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search games..."
                                className="w-full bg-transparent border-b-2 border-[#222] text-white text-[24px] lg:text-[32px] font-syne font-bold pb-4 pl-16 pr-4 focus:outline-none focus:border-accent placeholder:text-[#444] transition-colors"
                            />
                            <p className="text-text-muted text-[12px] font-inter mt-6 text-center">
                                Press <kbd className="bg-[#222] px-2 py-1 rounded text-white mx-1 font-sans">ESC</kbd> to close
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-0 z-[110] bg-[#111] flex flex-col lg:hidden"
                    >
                        <div className="h-[64px] flex items-center justify-between px-4">
                            <div className="font-syne text-[22px] font-[800] text-white flex items-center">
                                GRIDLOCK<span className="text-accent ml-1">.</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-text-muted hover:text-white transition-colors"
                            >
                                <FiX size={28} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-[32px]">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="font-syne text-[24px] font-[700] text-white hover:text-accent transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="p-6 border-t border-[#222] flex flex-col gap-4">
                            <button className="w-full py-3 text-[15px] font-inter font-[600] text-white border border-[#333] rounded-[8px] hover:bg-[#222] transition-colors">
                                Sign In
                            </button>
                            <button className="w-full py-3 text-[15px] font-inter font-[700] bg-accent text-black rounded-[8px] hover:brightness-110 transition-all">
                                Join Free
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
