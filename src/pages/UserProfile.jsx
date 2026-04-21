import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, limit, addDoc, deleteDoc, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import { FaShareAlt, FaGamepad, FaUserPlus, FaUserCheck } from "react-icons/fa";

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState({ played: 0, reviews: 0 });
  const [recentGames, setRecentGames] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [verdictStats, setVerdictStats] = useState({ mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 });
  const [publicCollections, setPublicCollections] = useState([]);

  // Follow system
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        // Find by username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const docData = snapshot.docs[0];
        const profileData = { id: docData.id, ...docData.data() };
        setProfile(profileData);

        const uid = profileData.id;

        // Fetch shelf (played games)
        const shelfRef = collection(db, `gameShelf/${uid}/games`);
        const shelfSnap = await getDocs(shelfRef);
        let playedGames = [];
        shelfSnap.forEach(d => {
          const data = d.data();
          if (data.status === "played") playedGames.push(data);
        });
        playedGames.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        setRecentGames(playedGames.slice(0, 6));
        setStats(prev => ({ ...prev, played: playedGames.length }));

        // Fetch reviews
        const revRef = collection(db, "reviews");
        const revQ = query(revRef, where("uid", "==", uid), limit(10));
        const revSnap = await getDocs(revQ);
        let revList = [];
        let vStats = { mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 };
        revSnap.forEach(d => {
          const data = d.data();
          revList.push({ id: d.id, ...data });
          if (data.verdict) { vStats[data.verdict] = (vStats[data.verdict] || 0) + 1; vStats.total++; }
        });
        revList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRecentReviews(revList.slice(0, 3));
        setVerdictStats(vStats);
        setStats(prev => ({ ...prev, reviews: vStats.total }));

        // Public collections
        const collRef = collection(db, "collections");
        const collQ = query(collRef, where("uid", "==", uid), where("isPublic", "==", true), limit(6));
        const collSnap = await getDocs(collQ);
        let collList = [];
        collSnap.forEach(d => collList.push({ id: d.id, ...d.data() }));
        setPublicCollections(collList);

        // Follow stats
        if (user && user.uid !== uid) {
          // Check if current user follows this profile
          const followQ = query(
            collection(db, "follows"),
            where("followerId", "==", user.uid),
            where("followingId", "==", uid)
          );
          const followSnap = await getDocs(followQ);
          setIsFollowing(!followSnap.empty);
        }

        // Follower count
        const followerQ = query(collection(db, "follows"), where("followingId", "==", uid));
        const followerCount = await getCountFromServer(followerQ);
        setFollowerCount(followerCount.data().count);

        // Following count
        const followingQ = query(collection(db, "follows"), where("followerId", "==", uid));
        const followingCount = await getCountFromServer(followingQ);
        setFollowingCount(followingCount.data().count);

      } catch (err) {
        console.error("Error fetching user profile:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!user || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const followQ = query(
          collection(db, "follows"),
          where("followerId", "==", user.uid),
          where("followingId", "==", profile.id)
        );
        const followSnap = await getDocs(followQ);
        if (!followSnap.empty) {
          await deleteDoc(followSnap.docs[0].ref);
        }
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await addDoc(collection(db, "follows"), {
          followerId: user.uid,
          followingId: profile.id,
          createdAt: new Date().toISOString()
        });
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const calcPct = (val) => verdictStats.total > 0 ? Math.round((val / verdictStats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[72px]">
        <div className="w-full h-[280px] bg-[#111] animate-pulse border-b border-[#1e1e1e]"></div>
        <div className="max-w-[1400px] mx-auto px-8 py-10 grid grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-[#111] rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[72px] flex items-center justify-center">
        <EmptyState
          icon="User"
          title="User not found"
          subtitle={`No player with username @${username} exists.`}
          ctaText="Back to Home"
          ctaLink="/"
        />
      </div>
    );
  }

  const joinedDate = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Unknown";

  const isOwnProfile = user?.uid === profile.id;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
      {/* HEADER */}
      <div className="w-full bg-[#111] border-b border-[#1e1e1e] relative overflow-hidden pb-10">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        ></div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-[var(--accent)] bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] overflow-hidden flex items-center justify-center text-3xl font-black text-black shadow-2xl shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (profile.displayName || profile.username || "?").charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="font-syne text-[36px] md:text-[44px] font-black leading-none">
                {profile.displayName || `@${profile.username}`}
              </h1>
              <p className="text-[16px] text-[var(--text-muted)]">@{profile.username}</p>
              {profile.bio && (
                <p className="text-[14px] leading-relaxed max-w-xl text-[#ccc] pt-2">{profile.bio}</p>
              )}
              <p className="text-[12px] text-[#555] pt-1 uppercase tracking-wider">Member since {joinedDate}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!isOwnProfile && user && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-5 h-10 rounded-lg font-syne font-bold transition-all flex items-center gap-2 text-[13px] ${
                    isFollowing
                      ? "bg-[#161616] border border-[#2a2a2a] hover:border-white text-white"
                      : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black"
                  } disabled:opacity-50`}
                >
                  {followLoading ? (
                    "..."
                  ) : isFollowing ? (
                    <>
                      <FaUserCheck /> Following
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Follow
                    </>
                  )}
                </button>
              )}
              {isOwnProfile && (
                <Link to="/settings" className="px-5 h-10 bg-[#161616] border border-[#2a2a2a] rounded-lg font-syne font-bold hover:border-white transition-all flex items-center text-[13px]">
                  Edit Profile
                </Link>
              )}
              <button onClick={handleShare} className="px-5 h-10 bg-[#161616] border border-[#2a2a2a] rounded-lg font-syne font-bold hover:border-white transition-all flex items-center gap-2 text-[13px]">
                <FaShareAlt /> Share
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { label: "Games Played", val: stats.played, color: "#2ed573" },
              { label: "Reviews", val: stats.reviews, color: "var(--accent)" },
              { label: "Followers", val: followerCount, color: "#e74c3c" },
              { label: "Following", val: followingCount, color: "#f39c12" },
            ].map((s, i) => (
              <div key={i} className="bg-[#161616] border border-[#222] rounded-xl p-5 text-center hover:border-[#333] transition-colors">
                <div className={`font-syne text-[32px] font-black leading-none mb-1`} style={{ color: s.color }}>
                  {s.val}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-[#1e1e1e] bg-[#111]/80 backdrop-blur-md sticky top-[64px] z-30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex overflow-x-auto no-scrollbar">
          {["Overview", "Reviews", "Collections"].map(tab => {
            const id = tab.toLowerCase();
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-4 font-syne font-bold text-[14px] whitespace-nowrap transition-all border-b-2 ${
                  activeTab === id ? "border-[var(--accent)] text-white" : "border-transparent text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
            <div className="space-y-12">
              {/* Recently Played */}
              <section>
                <h3 className="font-syne text-[20px] font-bold mb-6">Recently Played</h3>
                {recentGames.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {recentGames.map(g => (
                      <Link key={g.gameId} to={`/game/${g.gameId}`} className="w-[130px] shrink-0 group">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#222] mb-3 group-hover:border-[var(--accent)] transition-all">
                          <img src={g.coverImage} alt={g.gameName} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-[12px] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{g.gameName}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<FaGamepad />} title="Nothing played yet" subtitle="This player hasn't tracked any games." />
                )}
              </section>

              {/* Reviews */}
              <section>
                <h3 className="font-syne text-[20px] font-bold mb-6">Recent Reviews</h3>
                {recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentReviews.map(r => (
                      <div key={r.id} className="bg-[#161616] border border-[#222] rounded-xl p-5 flex gap-4">
                        <Link to={`/game/${r.gameId}`} className="w-14 h-18 shrink-0 rounded overflow-hidden border border-[#333]">
                          <img src={r.gameCover} alt="" className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Link to={`/game/${r.gameId}`} className="font-bold text-[15px] hover:text-[var(--accent)] transition-colors truncate">{r.gameName}</Link>
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-2 py-0.5 border border-[#333] rounded shrink-0">{r.verdict}</span>
                          </div>
                          <p className="text-[13px] text-[#aaa] line-clamp-2">{r.spoiler ? "Spoiler review." : r.reviewText}</p>
                          <div className="text-[11px] text-[#555] mt-2">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="R" title="No reviews yet" subtitle="This player hasn't written any reviews." />
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {verdictStats.total > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                  <h4 className="font-syne text-[18px] font-bold mb-6">Verdict Breakdown</h4>
                  <div className="space-y-4">
                    {[
                      { id: "mustPlay", label: "Must Play", color: "#2ed573" },
                      { id: "goodEnough", label: "Good Enough", color: "#ffa502" },
                      { id: "skipIt", label: "Skip It", color: "#ff4757" },
                      { id: "masterpiece", label: "Masterpiece", color: "#a855f7" },
                    ].map(v => {
                      const pct = calcPct(verdictStats[v.id] || 0);
                      return (
                        <div key={v.id}>
                          <div className="flex justify-between text-[12px] font-bold mb-1.5">
                            <span style={{ color: v.color }}>{v.label}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: v.color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {profile.preferences?.genres?.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                  <h4 className="font-syne text-[18px] font-bold mb-4">Favourite Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.genres.map(g => (
                      <span key={g} className="bg-[#1a1a1a] text-[12px] px-3 py-1.5 rounded-md border border-[#2a2a2a] text-[#ddd]">{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-syne text-[28px] font-bold mb-8">All Reviews by @{profile.username}</h2>
            {recentReviews.length > 0 ? recentReviews.map(r => (
              <div key={r.id} className="bg-[#161616] border border-[#222] rounded-xl p-6 hover:border-[#333] transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <Link to={`/game/${r.gameId}`} className="w-14 h-18 shrink-0 rounded overflow-hidden border border-[#2a2a2a]">
                    <img src={r.gameCover} alt="" className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link to={`/game/${r.gameId}`} className="font-syne text-[18px] font-bold hover:text-[var(--accent)] transition-colors">{r.gameName}</Link>
                      <span className="text-[11px] text-[#666]">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[11px] font-bold border border-[#333] uppercase">{r.verdict}</span>
                  </div>
                </div>
                <p className="text-[14px] text-[#ddd] leading-[1.6]">{r.reviewText}</p>
              </div>
            )) : (
              <EmptyState icon="R" title="No reviews written yet." />
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div>
            <h2 className="font-syne text-[28px] font-bold mb-8">Public Collections</h2>
            {publicCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCollections.map(c => (
                  <Link key={c.id} to={`/collections/${c.id}`} className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden group hover:border-[#444] transition-colors">
                    <div className="h-[120px] bg-[#222] border-b border-[#222] flex items-center justify-center text-3xl">List</div>
                    <div className="p-4">
                      <h3 className="font-bold text-[16px] group-hover:text-[var(--accent)] transition-colors">{c.title}</h3>
                      <p className="text-[12px] text-[#666] mt-1 line-clamp-1">{c.description}</p>
                      <div className="text-[11px] font-bold text-[#555] mt-3 uppercase tracking-wider">{(c.games || []).length} games</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="Books" title="No public collections" subtitle="This player hasn't shared any collections yet." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
