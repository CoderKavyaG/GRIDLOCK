import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { HiSparkles, HiHandThumbUp, HiHandThumbDown, HiMinus } from "react-icons/hi2";
import { FiArrowRight, FiShare2, FiDownload } from "react-icons/fi";
import { BiJoystick } from "react-icons/bi";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

export default function Rewind() {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchStats = async () => {
            try {
                // Fetch user's shelf
                const shelfRef = collection(db, `gameShelf/${user.uid}/games`);
                const shelfSnap = await getDocs(shelfRef);
                const shelfGames = shelfSnap.docs.map(doc => doc.data());

                // Fetch user's reviews
                const reviewsRef = query(collection(db, "reviews"), where("uid", "==", user.uid));
                const reviewsSnap = await getDocs(reviewsRef);
                const reviews = reviewsSnap.docs.map(doc => doc.data());

                // Calculate Stats
                const totalPlayed = shelfGames.filter(g => g.status === "played").length;
                const totalInShelf = shelfGames.length;
                
                // Favorite Genre (Mocking logic for now as RAWG genre info isn't always in shelf)
                const genres = ["Action", "RPG", "Adventure", "Shooter", "Indie"];
                const favGenre = genres[Math.floor(Math.random() * genres.length)];

                // Most common verdict
                const verdicts = reviews.map(r => r.verdict);
                const verdictCounts = verdicts.reduce((acc, v) => {
                    acc[v] = (acc[v] || 0) + 1;
                    return acc;
                }, {});
                const topVerdict = Object.keys(verdictCounts).reduce((a, b) => verdictCounts[a] > verdictCounts[b] ? a : b, "mustPlay");

                setStats({
                    totalPlayed,
                    totalInShelf,
                    favGenre,
                    topVerdict,
                    reviewsCount: reviews.length,
                    username: userProfile?.username || "Player"
                });
            } catch (err) {
                console.error("Rewind Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, userProfile, navigate]);

    const handleDownload = () => {
        const element = document.getElementById("rewind-card");
        html2canvas(element, { backgroundColor: '#0a0a0a' }).then(canvas => {
            const link = document.createElement('a');
            link.download = `gridlock-rewind-${stats.username}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                <p className="font-syne font-bold text-white/40 uppercase tracking-[0.2em] text-[12px]">Generating Your Year...</p>
            </div>
        </div>
    );

    const slides = [
        {
            title: "The Year in Gaming",
            value: "2025",
            subtitle: "Let's see how much time you actually spent playing.",
            icon: <HiSparkles className="text-accent" size={48} />
        },
        {
            title: "Library Growth",
            value: stats?.totalInShelf || 0,
            subtitle: "Games added to your shelf this year. Your backlog is screaming.",
            icon: <BiJoystick className="text-accent" size={48} />
        },
        {
            title: "Completed",
            value: stats?.totalPlayed || 0,
            subtitle: "Games reached the 'Played' status. You actually finished some!",
            icon: <HiHandThumbUp className="text-accent" size={48} />
        },
        {
            title: "Vibe Check",
            value: stats?.favGenre || "Gaming",
            subtitle: "Your most played genre. You have a type, and that's okay.",
            icon: <HiSparkles className="text-accent" size={48} />
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4 overflow-hidden">
            <SEO title="Rewind 2025" description="Your year in gaming, distilled into a single shareable moment." />
            <div className="max-w-[1400px] mx-auto h-[70vh] flex flex-col items-center justify-center relative">
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center flex flex-col items-center max-w-2xl px-8"
                    >
                        <div className="mb-8">{slides[activeSlide].icon}</div>
                        <h2 className="font-syne text-[14px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4">
                            {slides[activeSlide].title}
                        </h2>
                        <div className="font-syne text-[64px] md:text-[120px] font-black text-white leading-none mb-8 tracking-tighter">
                            {slides[activeSlide].value}
                        </div>
                        <p className="text-[18px] md:text-[22px] text-white/60 font-medium leading-relaxed">
                            {slides[activeSlide].subtitle}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 transition-all duration-300 rounded-full ${i === activeSlide ? 'w-12 bg-accent' : 'w-4 bg-white/10'}`} 
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="absolute inset-y-0 w-full flex items-center justify-between pointer-events-none">
                    <button 
                        onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                        className={`pointer-events-auto p-4 text-white/20 hover:text-white transition-colors ${activeSlide === 0 ? 'invisible' : ''}`}
                    >
                        <FiArrowRight size={32} className="rotate-180" />
                    </button>
                    {activeSlide < slides.length - 1 ? (
                        <button 
                            onClick={() => setActiveSlide(prev => prev + 1)}
                            className="pointer-events-auto p-4 text-white/20 hover:text-white transition-colors"
                        >
                            <FiArrowRight size={32} />
                        </button>
                    ) : (
                        <motion.button 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setActiveSlide(slides.length)} // Show summary
                            className="pointer-events-auto bg-accent text-black px-6 py-4 rounded-xl font-syne font-black text-[14px] uppercase tracking-widest hover:brightness-110 flex items-center gap-2"
                        >
                            See Your Card <FiArrowRight />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Final Summary Card (Modal-like) */}
            <AnimatePresence>
                {activeSlide === slides.length && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 overflow-y-auto pt-24"
                    >
                        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                            {/* Card to Capture */}
                            <div 
                                id="rewind-card"
                                className="w-full aspect-[4/5] bg-[#111] rounded-[24px] border-[12px] border-accent p-8 flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                                
                                <div>
                                    <div className="font-syne text-[14px] font-black tracking-widest text-accent mb-1">GRIDLOCK REWIND</div>
                                    <div className="font-syne text-[40px] font-black text-white leading-none">2025</div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                            <BiJoystick size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-white/40 uppercase font-bold tracking-wider">Games Collected</div>
                                            <div className="text-[20px] text-white font-black">{stats.totalInShelf}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                            <HiSparkles size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-white/40 uppercase font-bold tracking-wider">Top Genre</div>
                                            <div className="text-[20px] text-white font-black">{stats.favGenre}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                            <HiHandThumbUp size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-white/40 uppercase font-bold tracking-wider">Verdicts Cast</div>
                                            <div className="text-[20px] text-white font-black">{stats.reviewsCount}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-white/5 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 flex items-center justify-center text-[14px] font-bold">
                                        {stats.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-black text-white">@{stats.username}</div>
                                        <div className="text-[10px] text-white/40 font-bold tracking-tight">gridlock.gg/rewind</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
                                <button 
                                    onClick={handleDownload}
                                    className="flex-1 bg-white text-black py-4 rounded-xl font-syne font-black text-[14px] flex items-center justify-center gap-2 hover:brightness-90 transition-all"
                                >
                                    <FiDownload /> Export
                                </button>
                                <button className="flex-1 bg-white/5 text-white py-4 rounded-xl font-syne font-black text-[14px] flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all">
                                    <FiShare2 /> Share
                                </button>
                            </div>

                            <button onClick={() => setActiveSlide(0)} className="text-white/40 font-bold text-[13px] hover:text-white transition-colors mt-4">
                                Replay Rewind
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
