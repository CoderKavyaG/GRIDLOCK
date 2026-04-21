import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export const DashboardGreeting = ({ stats }) => {
    const { userProfile } = useAuth();
    
    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const actions = [
        { label: "Log a Game", icon: "G", link: "/" },
        { label: "Write a Review", icon: "R", link: "/" },
        { label: "Join a Debate", icon: "D", link: "/debates" },
        { label: "New Collection", icon: "Books", link: "/collections/new" },
    ];

    return (
        <section className="w-full bg-[#111] py-16 px-6 border-b border-[#1e1e1e]">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="font-syne text-[36px] md:text-[48px] font-black text-white leading-tight">
                            {getTimeOfDay()}, <span className="text-[var(--accent)]">{userProfile?.displayName || userProfile?.username}</span>.
                        </h1>
                        <p className="text-[16px] text-[#777] font-medium">
                            You've played <span className="text-white font-bold">{stats.played || 0}</span> games. 
                            <span className="text-white font-bold ml-1">{stats.wantToPlay || 0}</span> more on your backlog.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {actions.map((action, idx) => (
                            <Link 
                                key={idx}
                                to={action.link}
                                className="flex items-center gap-2 px-5 py-3 bg-[#161616] border border-[#2a2a2a] rounded-[16px] text-white font-syne font-black text-[13px] uppercase tracking-wider hover:border-[var(--accent)] hover:bg-[#1a1a1a] transition-all"
                            >
                                <span>{action.icon}</span>
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
