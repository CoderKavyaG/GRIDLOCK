import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useSearch } from '../context/SearchContext';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const { toggleSearch } = useSearch();
    
    const location = useLocation();
    const navigate = useNavigate();
    const { user, userProfile, signOut } = useAuth();

    const navLinks = [
        { name: 'Discover', path: '/' },
        { name: 'Debates', path: '/debates' },
        { name: 'Leaderboard', path: '/leaderboard' }
    ];

    if (user) {
        navLinks.push({ name: 'Collections', path: '/collections' });
        navLinks.push({ name: 'Shelf', path: '/shelf' });
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileMenuOpen]);



    const handleLogout = async () => {
        setDropdownOpen(false);
        await signOut();
        navigate('/');
    };

    return (
        <>
            <header className={`fixed top-0 left-0 w-full h-[64px] z-[100] transition-all duration-300 ease-in-out ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-[16px] border-b border-[#1e1e1e]' : 'bg-[#0a0a0a]/80 backdrop-blur-[8px] border-b border-white/5'}`}>
                <div className="max-w-[1400px] h-full mx-auto px-4 lg:px-8 flex items-center justify-between">
                    {/* Brand */}
                    <Link to="/" className="flex flex-col select-none relative z-10 w-[150px]">
                        <div className="font-syne text-[22px] font-[800] text-white flex items-center leading-none">
                            GRIDLOCK<span className="text-[var(--accent)] ml-1">.</span>
                        </div>
                        <span className="text-[var(--text-muted)] text-[10px] tracking-[0.15em] uppercase font-inter mt-[4px] leading-none">
                            Find Games That Matter
                        </span>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`font-inter text-[14px] font-[600] transition-colors duration-150 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* End */}
                    <div className="flex items-center justify-end gap-5 w-[150px] relative z-10">
                        <button onClick={toggleSearch} className="text-[var(--text-muted)] hover:text-white transition-colors" aria-label="Search">
                            <FiSearch size={20} />
                        </button>

                        <div className="hidden lg:flex items-center gap-4">
                            {!user ? (
                                <>
                                    <div className="w-[1px] h-[20px] bg-[#2a2a2a]"></div>
                                    <Link to="/login" className="text-[13px] font-inter font-bold text-[var(--text-muted)] hover:text-white transition-colors whitespace-nowrap">Sign In</Link>
                                    <Link to="/signup" className="text-[13px] font-inter font-[700] bg-[var(--accent)] text-black rounded-[6px] px-[16px] py-[8px] hover:brightness-110 transition-all whitespace-nowrap">Join Free</Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-5">
                                    <NotificationDropdown />
                                    <div className="relative">
                                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-8 h-8 rounded-full bg-[#222] border border-[#333] hover:border-[var(--accent)] overflow-hidden transition-all flex items-center justify-center">
                                         {userProfile?.avatar ? <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover"/> : <span className="text-[14px] font-bold">{userProfile?.username?.charAt(0).toUpperCase() || "U"}</span>}
                                    </button>
                                    
                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-3 w-48 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-2xl py-2 flex flex-col z-50 text-[13px] font-bold"
                                            >
                                                 <div className="px-4 py-2 border-b border-[#2a2a2a] mb-2 pointer-events-none">
                                                     <div className="text-white truncate">@{userProfile?.username}</div>
                                                 </div>
                                                 <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[var(--text-muted)] hover:text-white hover:bg-[#222] transition-colors"><FiUser /> Profile</Link>
                                                 <Link to="/rewind" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"><HiSparkles size={14} aria-hidden="true" /> Rewind 2025</Link>
                                                 <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[var(--text-muted)] hover:text-white hover:bg-[#222] transition-colors"><FiSettings /> Settings</Link>
                                                 <button onClick={handleLogout} className="flex items-center justify-start gap-3 px-4 py-2 text-[#ff4757] hover:bg-[#ff4757]/10 w-full text-left transition-colors"><FiLogOut /> Sign Out</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            )}
                        </div>

                        <button className="lg:hidden text-[var(--text-muted)] hover:text-white transition-colors" onClick={() => setMobileMenuOpen(true)}>
                            <FiMenu size={24} />
                        </button>
                    </div>
                </div>
            </header>



            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed inset-0 z-[110] bg-[#0a0a0a] flex flex-col lg:hidden">
                        <div className="h-[64px] flex items-center justify-between px-4 border-b border-[#1e1e1e]">
                            <div className="font-syne text-[22px] font-[800] text-white flex items-center">GRIDLOCK<span className="text-[var(--accent)] ml-1">.</span></div>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                                <FiX size={28} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-[32px]">
                            {navLinks.map((link) => (
                                <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="font-syne text-[24px] font-[700] text-white hover:text-[var(--accent)] transition-colors">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="p-6 border-t border-[#1e1e1e] flex flex-col gap-4">
                            {!user ? (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center py-3 text-[15px] font-[600] text-white border border-[#333] rounded-[8px] hover:bg-[#222] transition-colors">Sign In</Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center py-3 text-[15px] font-[700] bg-[var(--accent)] text-black rounded-[8px]">Join Free</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center py-3 text-[14px] font-[600] text-white border border-[#333] rounded-[8px] hover:bg-[#222]">My Profile</Link>
                                    <Link to="/rewind" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center py-3 text-[14px] font-[700] text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/5 rounded-[8px] gap-2"><HiSparkles size={14} aria-hidden="true" /> Rewind 2025</Link>
                                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center py-3 text-[14px] font-[600] text-[var(--text-muted)] border border-transparent hover:text-white">Settings</Link>
                                    <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="mt-2 text-[#ff4757] font-bold text-[14px]">Sign Out</button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
