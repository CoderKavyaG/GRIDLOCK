import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const VERDICT_COLORS = {
    mustPlay: "var(--accent-green)",
    goodEnough: "var(--accent-yellow)",
    skipIt: "var(--accent-red)",
    masterpiece: "var(--accent-purple)"
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
                {[1,2,3].map(i => <div key={i} className="min-w-[320px] h-48 bg-[#111] rounded-2xl flex-shrink-0"></div>)}
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

                <div className={`${horizontal ? 'flex overflow-x-auto no-scrollbar gap-6 pb-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min'}`}>
                    {reviews.map((review) => (
                        <div 
                            key={review.id} 
                            className={`${horizontal ? 'min-w-[320px] md:min-w-[380px]' : ''} bg-[#161616] border border-[#222] rounded-[24px] p-6 hover:border-[#333] transition-all group relative overflow-hidden flex flex-col`}
                        >
                            {/* Card Content */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#222] border-2 border-[var(--accent)] overflow-hidden shrink-0">
                                        {review.avatar ? (
                                            <img src={review.avatar} alt={review.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-[14px]">
                                                {review.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <Link to={`/user/${review.username}`} className="font-bold text-[14px] text-white hover:text-[var(--accent)] transition-colors block truncate">
                                            @{review.username}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span 
                                                className="text-[9px] font-[900] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/5"
                                                style={{ 
                                                    color: VERDICT_COLORS[review.verdict],
                                                    backgroundColor: `${VERDICT_COLORS[review.verdict]}10`
                                                }}
                                            >
                                                {review.verdict}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link to={`/game/${review.gameId}`} className="w-12 h-16 rounded-lg overflow-hidden border border-[#333] shrink-0 group-hover:scale-105 transition-transform shadow-xl">
                                    <img src={review.gameCover} alt={review.gameName} className="w-full h-full object-cover" />
                                </Link>
                            </div>

                            <p className="text-[14px] leading-[1.7] text-[#bbb] italic line-clamp-3 mb-6 flex-1">
                                "{review.reviewText || "No text provided for this verdict."}"
                            </p>

                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#444]">
                                <span className="truncate max-w-[150px]">{review.gameName}</span>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {!horizontal && (
                    <div className="mt-16 text-center">
                        <Link 
                            to="/signup" 
                            className="inline-block text-[14px] md:text-[16px] font-syne font-[900] text-white hover:text-[var(--accent)] transition-all border-b-2 border-transparent hover:border-[var(--accent)] pb-1"
                        >
                            Join 10,000 gamers writing real reviews →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

