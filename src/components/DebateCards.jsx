import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, query, where, orderBy, limit as fsLimit, getDocs } from 'firebase/firestore';
import { BiTrendingUp } from 'react-icons/bi';
import { FiMessageSquare, FiArrowRight } from 'react-icons/fi';

export const DebateCards = ({ limit = 3, horizontal = false, titleVisibility = true }) => {
    const [debatesState, setDebatesState] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebates = async () => {
            try {
                const dRef = collection(db, "debates");
                // Only fetch approved debates
                const q = query(
                    dRef, 
                    where("approved", "==", true),
                    orderBy("createdAt", "desc"), 
                    fsLimit(limit)
                );
                const snapshot = await getDocs(q);
                const list = [];
                snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
                setDebatesState(list);
            } catch (err) {
                console.error("DebateCards fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDebates();
    }, [limit]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="w-full flex gap-4 overflow-hidden animate-pulse px-4 lg:px-8">
                {[1, 2, 3].map(i => <div key={i} className="flex-1 h-64 bg-[#161616] rounded-xl border border-[#222]"></div>)}
            </div>
        );
    }

    return (
        <section className={`w-full ${titleVisibility ? 'bg-[#111] py-[80px]' : ''}`}>
            <div className={`${titleVisibility ? 'max-w-[1400px] mx-auto px-4 lg:px-8' : ''}`}>
                {/* Header */}
                {titleVisibility && (
                    <div className="mb-[48px]">
                        <span className="inline-block bg-[#ff4757] text-white text-[10px] uppercase tracking-[0.15em] font-[700] px-[10px] py-[3px] rounded-[4px] mb-4">
                            TRENDING DEBATES
                        </span>
                        <h2 className="font-syne text-[40px] font-[800] text-white leading-tight mb-2">
                            Community Debates
                        </h2>
                        <p className="text-text-muted text-[16px]">
                            Real takes. No filters. Join the debate.
                        </p>
                    </div>
                )}

                {/* Debate Cards */}
                <motion.div
                    className={`flex ${horizontal ? 'flex-row overflow-x-auto no-scrollbar pb-4' : 'flex-col lg:flex-row'} gap-[20px]`}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {debatesState.map((debate) => {
                        const total = (debate.agreeCount || 0) + (debate.disagreeCount || 0);
                        const agreePct = total > 0 ? Math.round((debate.agreeCount / total) * 100) : 50;
                        const disagreePct = 100 - agreePct;

                        return (
                            <motion.div
                                key={debate.id}
                                variants={itemVariants}
                                className={`${horizontal ? 'min-w-[340px] md:min-w-[400px]' : 'flex-1'} bg-[#161616] border border-[#222] rounded-[12px] p-[24px] flex flex-col`}
                            >
                                {/* Top Row */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={debate.gameCover}
                                            alt={debate.gameName}
                                            className="w-[56px] h-[72px] object-cover rounded-[4px]"
                                            loading="lazy"
                                        />
                                        <span className="text-[12px] text-text-muted font-[500] max-w-[100px] line-clamp-2 leading-tight">
                                            {debate.gameName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-[10px] font-[700] px-[8px] py-[2px] rounded-full">
                                        <BiTrendingUp size={10} aria-hidden="true" /> TRENDING
                                    </div>
                                </div>

                                {/* Statement */}
                                <h3 className="font-syne text-[17px] font-[700] text-white leading-[1.4] my-[16px]">
                                    "{debate.statement}"
                                </h3>

                                {/* Verdict Split Bar */}
                                <div className="flex flex-col gap-1 mb-[20px]">
                                    <div className="flex justify-between text-[10px] font-[600] tracking-wider mb-1 text-text-muted">
                                        <span className="text-[#2ed573]">AGREE {agreePct}%</span>
                                        <span className="text-[#ff4757]">DISAGREE {disagreePct}%</span>
                                    </div>
                                    <div className="w-full h-[6px] rounded-full overflow-hidden flex bg-[#333]">
                                        <div style={{ width: `${agreePct}%` }} className="bg-[#2ed573] h-full transition-all duration-500"></div>
                                        <div style={{ width: `${disagreePct}%` }} className="bg-[#ff4757] h-full transition-all duration-500"></div>
                                    </div>
                                </div>

                                {/* Avatars (Placeholder) */}
                                <div className="flex items-center mt-auto mb-[20px]">
                                    <div className="flex">
                                        {[1, 2, 3, 4].map((id) => (
                                            <div
                                                key={id}
                                                className={`w-[28px] h-[28px] rounded-full border-2 border-[#161616] bg-[#222] ${id !== 1 ? '-ml-[8px]' : ''}`}
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="text-[12px] text-text-muted ml-3">
                                        + {total} joined
                                    </span>
                                </div>

                                {/* Reactions & CTA */}
                                <div className="flex items-center justify-between pt-[16px] border-t border-[#222]">
                                    <div className="flex gap-[12px] text-[12px] text-text-muted font-bold flex items-center">
                                        <FiMessageSquare size={14} aria-hidden="true" /> <span>{total}</span>
                                    </div>
                                    <Link to={`/debates/${debate.id}`} className="flex items-center gap-2 text-[13px] text-[var(--accent)] font-[800] hover:underline transition-all uppercase tracking-wider">
                                        Join Debate <FiArrowRight size={14} aria-hidden="true" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

