import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { HiHandThumbUp, HiHandThumbDown, HiMinus, HiSparkles } from "react-icons/hi2";

const VERDICT_COLORS = {
    mustPlay: { label: "Go for it", color: "#2ed573", icon: HiHandThumbUp },
    goodEnough: { label: "Timepass", color: "#ffa502", icon: HiMinus },
    skipIt: { label: "Skip", color: "#ff4757", icon: HiHandThumbDown },
    masterpiece: { label: "Perfection", color: "#a855f7", icon: HiSparkles }
};

export const CommunityReviewsGrid = ({ title, horizontal = false, limit: fetchLimit = 6 }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentReviews = async () => {
            try {
                const reviewsRef = collection(db, "reviews");
                const q = query(reviewsRef, orderBy("createdAt", "desc"), limit(fetchLimit));
                const snapshot = await getDocs(q);
                const list = [];
                snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
                setReviews(list);
            } catch (err) {
                console.error("Reviews grid error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentReviews();
    }, [fetchLimit]);

    if (loading) {
        return (
            <div className="w-full py-12 px-6 max-w-[1400px] mx-auto animate-pulse flex gap-6 overflow-hidden">
                {[1,2,3].map(i => <div key={i} className="min-w-[320px] h-64 bg-[#111] rounded-2xl flex-shrink-0"></div>)}
            </div>
        );
    }

    return (
        <section className={`w-full ${horizontal ? '' : 'bg-[#0a0a0a] py-[100px] px-6'}`}>
            <div className={`max-w-[1400px] mx-auto ${horizontal ? 'px-6' : ''}`}>
                <div className={`flex flex-col md:flex-row md:items-end justify-between ${horizontal ? 'mb-8' : 'mb-12 border-b border-[#1a1a1a] pb-8'}`}>
                    <div>
                        {!horizontal && <h4 className="text-[11px] font-[900] text-[#555] uppercase tracking-[0.2em] mb-4">SOCIAL PROOF</h4>}
                        <h2 className={`font-syne ${horizontal ? 'text-[28px]' : 'text-[36px] md:text-[48px]'} font-black text-white leading-none`}>
                            {title || (<span>Community <span className="text-[var(--accent)]">Takes.</span></span>)}
                        </h2>
                    </div>
                </div>

                <div className={`${horizontal ? 'flex overflow-x-auto no-scrollbar gap-6 pb-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                    {reviews.map((review) => {
                        const verdictInfo = VERDICT_COLORS[review.verdict];
                        const Icon = verdictInfo?.icon;
                        
                        return (
                            <div 
                                key={review.id} 
                                className={`${horizontal ? 'min-w-[360px]' : ''} bg-[#161616] border border-[#222] rounded-[16px] p-6 hover:border-[#333] transition-all group`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] flex items-center justify-center font-bold text-black flex-shrink-0 overflow-hidden">
                                            {review.avatar ? (
                                                <img src={review.avatar} alt={review.username} className="w-full h-full object-cover" />
                                            ) : (
                                                review.username?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <Link to={`/user/${review.username}`} className="font-bold text-[15px] text-white hover:text-[var(--accent)] transition-colors block truncate">
                                                @{review.username}
                                            </Link>
                                            <div className="text-[12px] text-[#888]">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Game Cover */}
                                    <Link to={`/game/${review.gameId}`} className="w-14 h-20 rounded-lg overflow-hidden border border-[#333] flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <img src={review.gameCover} alt={review.gameName} className="w-full h-full object-cover" />
                                    </Link>
                                </div>

                                {/* Verdict Meter */}
                                <div className="mb-6 p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        {Icon && <Icon size={20} style={{color: verdictInfo.color}} />}
                                        <div className="flex-1">
                                            <div className="text-[13px] font-bold uppercase tracking-wider" style={{color: verdictInfo.color}}>
                                                {verdictInfo.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                                        <div 
                                            className="h-full rounded-full"
                                            style={{ width: '75%', backgroundColor: verdictInfo.color }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Review Text */}
                                {review.reviewText && (
                                    <p className="text-[14px] leading-[1.6] text-[#bbb] mb-5 line-clamp-3">
                                        {review.reviewText}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="pt-4 border-t border-[#222] flex items-center gap-4 text-[12px] text-[#666]">
                                    <button className="flex items-center gap-1.5 hover:text-[#2ed573] transition-colors font-medium">
                                        <HiHandThumbUp size={14} /> {(review.likes || []).length}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {reviews.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-[#888]">No reviews yet. Be the first!</p>
                    </div>
                )}
            </div>
        </section>
    );
};

