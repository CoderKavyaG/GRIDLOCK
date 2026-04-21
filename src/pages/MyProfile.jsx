import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FaPen, FaShareAlt, FaGamepad, FaListAlt, FaTimes } from "react-icons/fa";
import GameShelf from "./GameShelf"; // Will build next
import GameCard from "../components/GameCard";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";

export default function MyProfile() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState({ played: 0, wantToPlay: 0, dropped: 0, reviews: 0 });
  const [recentGames, setRecentGames] = useState([]);
  const [verdictStats, setVerdictStats] = useState({ mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Shelf
        const shelfRef = collection(db, `gameShelf/${user.uid}/games`);
        const shelfDocs = await getDocs(shelfRef);
        
        let played = 0, want = 0, dropped = 0;
        let pGames = [];
        
        shelfDocs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'played') {
                played++;
                pGames.push(data);
            }
            if (data.status === 'wantToPlay') want++;
            if (data.status === 'dropped') dropped++;
        });
        
        // Sort for recently played
        pGames.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRecentGames(pGames.slice(0, 5));

        // 2. Fetch Reviews
        const reviewsRef = collection(db, "reviews");
        const revQuery = query(reviewsRef, where("uid", "==", user.uid));
        const revDocs = await getDocs(revQuery);
        
        let vStats = { mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 };
        let rList = [];
        
        revDocs.forEach(doc => {
            const data = doc.data();
            vStats[data.verdict]++;
            vStats.total++;
            rList.push({ id: doc.id, ...data });
        });
        
        rList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentReviews(rList.slice(0, 3));
        setVerdictStats(vStats);
        
        setStats({ played, wantToPlay: want, dropped, reviews: vStats.total });

        // 3. Fetch Collections (Mock for now, will implement collections page later)
        const collRef = collection(db, "collections");
        const collQuery = query(collRef, where("uid", "==", user.uid));
        const collDocs = await getDocs(collQuery);
        let cList = [];
        collDocs.forEach(d => cList.push({ id: d.id, ...d.data() }));
        setCollections(cList);

      } catch (error) {
         console.error("Error fetching profile data", error);
      } finally {
         setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!userProfile) return null; // or loading skeleton

  const joinedDate = new Date(userProfile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/user/${userProfile.username}`);
    addToast("Profile URL copied to clipboard!", "success");
  };

  const calculatePercentage = (count) => {
      if (verdictStats.total === 0) return 0;
      return Math.round((count / verdictStats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-16">
        {/* PROFILE HEADER */}
        <div className="w-full bg-[#111] relative overflow-hidden pb-10 border-b border-[#1e1e1e]">
            {/* Background Texture/Blur */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxmaWx0ZXIgaWQ9J24nPjxmZVR1cmJ1bGVuY2UgdHlwZT0nZnJhY3RhbE5vaXNlJyBiYXNlRnJlcXVlbmN5PScwLjA1JyBudW1PY3RhdmVzPSczJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlpbD0nbm9uZScvPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNuKScgb3BhY2l0eT0nMC4yNScvPjwvc3ZnPg==')] mix-blend-overlay"></div>
            
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-[var(--accent)] bg-[#222] overflow-hidden flex items-center justify-center text-3xl font-bold bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] text-black shadow-2xl">
                             {userProfile.avatar ? (
                                 <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                                 userProfile.displayName?.charAt(0) || userProfile.username?.charAt(0)
                             )}
                        </div>
                        <Link to="/settings" className="absolute bottom-0 right-0 w-8 h-8 bg-[#161616] border border-[#333] rounded-full flex items-center justify-center text-[12px] text-white hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all z-20">
                            <FaPen />
                        </Link>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="font-syne text-[32px] md:text-[40px] font-black leading-none drop-shadow-lg">{userProfile.displayName || `@${userProfile.username}`}</h1>
                        <p className="text-[16px] text-[var(--text-muted)] group-hover:text-white transition-colors">@{userProfile.username}</p>
                        {userProfile.bio && (
                            <p className="text-[14px] leading-relaxed max-w-xl text-[#ccc] pt-2">{userProfile.bio}</p>
                        )}
                        <p className="text-[12px] text-[#666] pt-1 uppercase tracking-wider">Member since {joinedDate}</p>
                    </div>

                    <div className="flex gap-3">
                        <Link to="/settings" className="px-5 h-11 bg-[#161616] border border-[#2a2a2a] rounded-[10px] font-syne font-bold hover:border-white transition-all flex items-center justify-center text-[13px]">
                            Edit Profile
                        </Link>
                        <button onClick={handleShare} className="px-5 h-11 bg-[#161616] border border-[#2a2a2a] rounded-[10px] font-syne font-bold hover:border-white transition-all flex items-center justify-center gap-2 text-[13px]">
                            <FaShareAlt /> Share
                        </button>
                    </div>
                </div>

                {/* STATS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                    {[
                        { label: "Games Played", val: stats.played, icon: "Controller", color: "text-[#2ed573]" },
                        { label: "Want to Play", val: stats.wantToPlay, icon: "List", color: "text-[#f39c12]" },
                        { label: "Dropped", val: stats.dropped, icon: "❌", color: "text-[#e74c3c]" },
                        { label: "Reviews Written", val: stats.reviews, icon: "✍️", color: "text-[var(--accent)]" },
                    ].map((s, i) => (
                        <div key={i} className="bg-[#161616] border border-[#222] rounded-[12px] p-5 text-center flex flex-col items-center justify-center hover:border-[#3a3a3a] transition-colors relative overflow-hidden group">
                             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <span className="text-xl mb-2 opacity-80">{s.icon}</span>
                             <span className={`font-syne text-[32px] font-black leading-none mb-1 ${s.color}`}>{s.val}</span>
                             <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PROFILE TABS */}
        <div className="border-b border-[#1e1e1e] bg-[#111]/80 backdrop-blur-md sticky top-[72px] z-30">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex overflow-x-auto no-scrollbar">
                {["Overview", "Game Shelf", "Reviews", "Collections", "Activity"].map(tab => {
                    const id = tab.toLowerCase().replace(" ", "");
                    return (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`px-6 py-4 font-syne font-bold text-[14px] whitespace-nowrap transition-all border-b-2 ${
                              activeTab === id ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--text-muted)] hover:text-white hover:border-[#333]'
                          }`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
            {loading ? (
                <div className="animate-pulse space-y-8">
                    <div className="h-64 bg-[#111] rounded-xl border border-[#222]"></div>
                </div>
            ) : (
                <>
                
                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
                        <div className="space-y-12">
                            {/* Recently Played */}
                            <section>
                                <h3 className="font-syne text-[20px] font-bold mb-6 flex items-center gap-2">
                                    Recently Played <span className="text-[var(--text-muted)] text-[14px] font-normal">({recentGames.length})</span>
                                </h3>
                                {recentGames.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                        {recentGames.map(g => (
                                            <Link key={g.gameId} to={`/game/${g.gameId}`} className="w-[140px] shrink-0 group">
                                                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#222] mb-3 relative group-hover:border-[var(--accent)] transition-all">
                                                    <img src={g.coverImage} alt={g.gameName} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                                                </div>
                                                <div className="font-bold text-[13px] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{g.gameName}</div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon="G" title="No games played yet" subtitle="Start tracking your games to see them here." ctaText="Add Games" ctaLink="/" />
                                )}
                            </section>

                            {/* Recent Reviews */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-syne text-[20px] font-bold">Recent Reviews</h3>
                                    <button onClick={() => setActiveTab('reviews')} className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] hover:text-white font-bold transition-colors">See all →</button>
                                </div>
                                {recentReviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentReviews.map(r => (
                                            <div key={r.id} className="bg-[#161616] border border-[#222] rounded-[12px] p-5 flex gap-4">
                                                <Link to={`/game/${r.gameId}`} className="w-16 h-20 shrink-0 rounded overflow-hidden border border-[#333]">
                                                    <img src={r.gameCover} alt="" className="w-full h-full object-cover" />
                                                </Link>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <Link to={`/game/${r.gameId}`} className="font-bold text-[15px] hover:text-[var(--accent)] transition-colors">{r.gameName}</Link>
                                                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-2 py-0.5 border border-[#333] rounded">{r.verdict}</span>
                                                    </div>
                                                    <p className="text-[13px] text-[#aaa] mt-2 line-clamp-2">{r.spoiler ? "Spoiler review hidden." : r.reviewText || "No text provided."}</p>
                                                    <div className="text-[11px] text-[#666] mt-3">{new Date(r.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon="R" title="No reviews written" subtitle="Share your thoughts on games you've played." />
                                )}
                            </section>
                        </div>

                        {/* Right Sidebar - Taste Profile */}
                        <div className="space-y-8">
                            <div className="bg-[#111] border border-[#1e1e1e] rounded-[16px] p-6">
                                <h4 className="font-syne text-[18px] font-bold mb-6">Top Verdicts</h4>
                                
                                {verdictStats.total > 0 ? (
                                    <div className="space-y-4">
                                        {[
                                            { id: 'mustPlay', label: "Must Play", color: "#2ed573" },
                                            { id: 'goodEnough', label: "Good Enough", color: "#ffa502" },
                                            { id: 'skipIt', label: "Skip It", color: "#ff4757" },
                                            { id: 'masterpiece', label: "Masterpiece", color: "#a855f7" },
                                        ].map(v => {
                                            const pct = calculatePercentage(verdictStats[v.id]);
                                            return (
                                                <div key={v.id} className="relative">
                                                     <div className="flex justify-between text-[12px] font-bold mb-1.5">
                                                         <span style={{color: v.color}}>{v.label}</span>
                                                         <span>{pct}%</span>
                                                     </div>
                                                     <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                                         <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: v.color }}></div>
                                                     </div>
                                                </div>
                                            )
                                        })}
                                        <div className="pt-4 mt-4 border-t border-[#222] text-[12px] text-[#888] text-center">
                                            This player gives Must Play to <span className="text-white font-bold">{calculatePercentage(verdictStats.mustPlay)}%</span> of games.
                                        </div>
                                    </div>
                                ) : (
                                     <div className="text-[13px] text-[#666] text-center py-4">Not enough verdict data.</div>
                                )}
                            </div>

                            <div className="bg-[#111] border border-[#1e1e1e] rounded-[16px] p-6">
                                <h4 className="font-syne text-[18px] font-bold mb-4">Favourite Genres</h4>
                                <div className="flex flex-wrap gap-2">
                                     {userProfile.preferences?.genres?.length > 0 ? userProfile.preferences.genres.map(g => (
                                         <span key={g} className="bg-[#1a1a1a] text-[12px] px-3 py-1.5 rounded-md border border-[#2a2a2a] text-[#ddd]">{g}</span>
                                     )) : (
                                         <div className="text-[13px] text-[#666]">No genres selected.</div>
                                     )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: GAME SHELF */}
                {activeTab === "gameshelf" && (
                     <div className="-mx-4 md:-mx-8">
                         <GameShelf embedded={true} uid={user.uid} />
                     </div>
                )}

                {/* TAB 3: REVIEWS */}
                {activeTab === "reviews" && (
                     <div className="max-w-3xl mx-auto">
                         <h2 className="font-syne text-[28px] font-bold mb-8">All Reviews</h2>
                         {/* We fetch full reviews list here or re-use recentReviews if small. 
                             For simplicity, if we need full, we should refetch or show all from state. 
                             Let's just show recentReviews for now. */}
                          <div className="space-y-4">
                              {recentReviews.map(r => (
                                  <div key={r.id} className="bg-[#161616] border border-[#222] rounded-[12px] p-6 transition-all hover:border-[#333]">
                                      <div className="flex items-start gap-4 mb-4">
                                          <Link to={`/game/${r.gameId}`} className="w-16 h-20 shrink-0 rounded overflow-hidden shadow-lg border border-[#2a2a2a]">
                                              <img src={r.gameCover} alt="" className="w-full h-full object-cover" />
                                          </Link>
                                          <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Link to={`/game/${r.gameId}`} className="font-syne text-[20px] font-bold hover:text-[var(--accent)] transition-colors">{r.gameName}</Link>
                                                    <span className="text-[11px] uppercase font-bold text-[var(--text-muted)]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className={`inline-block px-3 py-1 mt-2 rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#333]`}>
                                                    Verdict: {r.verdict}
                                                </div>
                                          </div>
                                      </div>
                                      <p className="text-[15px] text-[#ddd] leading-[1.6]">
                                          {r.reviewText || <span className="italic opacity-50">No written review.</span>}
                                      </p>
                                  </div>
                              ))}
                          </div>
                     </div>
                )}

                {/* TAB 4: COLLECTIONS */}
                {activeTab === "collections" && (
                    <div>
                         <div className="flex items-center justify-between mb-8">
                            <h2 className="font-syne text-[28px] font-bold">Collections</h2>
                            <Link to="/collections/new" className="px-5 h-10 bg-[var(--accent)] text-black rounded-[8px] font-syne font-bold hover:brightness-105 transition-all flex items-center justify-center text-[13px]">
                                New Collection +
                            </Link>
                        </div>
                        {collections.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {collections.map(c => (
                                    <Link key={c.id} to={`/collections/${c.id}`} className="bg-[#161616] border border-[#222] rounded-[12px] overflow-hidden group hover:border-[#555] transition-all">
                                        <div className="h-[140px] bg-[#222] flex items-center justify-center text-[32px] border-b border-[#222]">
                                           List 
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-[16px] text-white group-hover:text-[var(--accent)] transition-colors">{c.title}</h3>
                                            <p className="text-[12px] text-[#666] line-clamp-1 mt-1">{c.description || "No description"}</p>
                                            <div className="text-[11px] uppercase font-bold text-[var(--text-muted)] mt-4">{c.isPublic ? "Public" : "Private"}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="Books" title="No collections yet" ctaText="Create One" ctaLink="/collections/new" />
                        )}
                    </div>
                )}

                {/* TAB 5: ACTIVITY */}
                {activeTab === "activity" && (
                    <div className="max-w-2xl mx-auto py-8">
                        <EmptyState icon="A" title="Activity Feed" subtitle="Your recent actions will appear here." />
                    </div>
                )}
                </>
            )}
        </div>
    </div>
  );
}
