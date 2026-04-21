import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { rawg } from "../api/rawg";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";
import AddToShelfButton from "../components/AddToShelfButton";
import VerdictModal from "../components/VerdictModal";
import WriteReviewModal from "../components/WriteReviewModal";
import Lightbox from "../components/Lightbox";
import EmptyState from "../components/EmptyState";
import { FiBookmark, FiShare2, FiCalendar, FiBriefcase, FiClock, FiFlag, FiArrowRight, FiX } from "react-icons/fi";
import { HiHandThumbUp, HiHandThumbDown, HiMinus, HiSparkles } from "react-icons/hi2";
import { BiJoystick } from "react-icons/bi";

export default function GameDetail() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [verdictStats, setVerdictStats] = useState({ mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 });
  const [dominantVerdict, setDominantVerdict] = useState(null);
  
  const [userVerdict, setUserVerdict] = useState(null);
  const [userShelfStatus, setUserShelfStatus] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [trailerFullscreen, setTrailerFullscreen] = useState(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch Game Details
  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const gameRes = await fetch(rawg.gameDetails(gameId));
        const gameData = await gameRes.json();
        setGame(gameData);

        // Try to fetch screenshots
        try {
          const screensRes = await fetch(rawg.gameScreenshots(gameId));
          if (screensRes.ok) {
            const screensData = await screensRes.json();
            setScreenshots(screensData.results || []);
          }
        } catch (err) {
          console.warn("Failed to fetch screenshots:", err.message);
          setScreenshots([]);
        }

        // Try to fetch movies/trailers
        try {
          const moviesRes = await fetch(rawg.gameMovies(gameId));
          if (moviesRes.ok) {
            const moviesData = await moviesRes.json();
            if (moviesData.results && moviesData.results.length > 0) {
              setTrailer(moviesData.results[0]);
            }
          }
        } catch (err) {
          console.warn("Failed to fetch movies:", err.message);
          setTrailer(null);
        }
      } catch (err) {
        console.error("Error fetching game data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  // Fetch User specific data and Game specific community stats from Firebase
  useEffect(() => {
    const fetchFirebaseData = async () => {
      try {
        // Fetch community reviews mapped to this game (only approved ones)
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef, 
          where("gameId", "==", parseInt(gameId)),
          where("approved", "==", true),
          orderBy("createdAt", "desc"), 
          limit(10)
        );
        const reviewDocs = await getDocs(q);
        
        const fetchedReviews = [];
        const stats = { mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 };
        
        // First, count all votes from the votes collection
        try {
          const votesRef = collection(db, "votes");
          const votesQuery = query(votesRef, where("gameId", "==", parseInt(gameId)));
          const votesDocs = await getDocs(votesQuery);
          
          votesDocs.forEach(doc => {
            const data = doc.data();
            if (stats[data.verdict] !== undefined) {
              stats[data.verdict]++;
              stats.total++;
            }
          });
        } catch (votesErr) {
          console.warn("Failed to fetch votes:", votesErr);
        }
        
        // Then collect reviews for display
        reviewDocs.forEach(doc => {
            const data = doc.data();
            fetchedReviews.push({ id: doc.id, ...data });
        });
        
        setReviews(fetchedReviews);

        // Fetch user specific data
        if (user) {
          // Check shelf
          const shelfRef = doc(db, `gameShelf/${user.uid}/games/${gameId}`);
          const shelfDoc = await getDoc(shelfRef);
          if (shelfDoc.exists()) {
              setUserShelfStatus(shelfDoc.data().status);
          }

          // Check user vote
          const voteRef = doc(db, "votes", `${user.uid}_${gameId}`);
          const voteDoc = await getDoc(voteRef);
          if (voteDoc.exists()) {
              setUserVerdict(voteDoc.data().verdict);
          }
        }
        
        setVerdictStats(stats);
        
        // Calculate dominant verdict
        let maxVerdict = null;
        let maxCount = 0;
        for (const [key, val] of Object.entries(stats)) {
            if (key !== 'total' && val > maxCount) {
                maxCount = val;
                maxVerdict = key;
            }
        }
        setDominantVerdict(maxVerdict);

      } catch (error) {
         console.error("Error fetching firebase data", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    // Only fetch once gameData is set so we have gameId as a number easily if needed
    if (gameId) {
        fetchFirebaseData();
    }

  }, [gameId, user]);


  if (loading) {
    return (
      <div className="animate-pulse bg-[#0a0a0a] min-h-screen pt-16">
        <div className="h-[480px] w-full bg-[#111]"></div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex gap-8">
            <div className="w-48 h-64 bg-[#222] rounded-lg -mt-24 rounded-lg relative z-10 hidden md:block"></div>
            <div className="flex-1 space-y-4 pt-12">
                <div className="h-10 bg-[#222] w-2/3 rounded"></div>
                <div className="h-6 bg-[#222] w-1/3 rounded"></div>
            </div>
        </div>
      </div>
    );
  }

  if (!game) return <EmptyState title="Game not found" subtitle="The game you requested could not be found." />;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied to clipboard ✓", "success");
  };
  
  const getVerdictMetadata = (v) => {
      switch(v) {
          case 'mustPlay': return { label: "MUST PLAY", color: "#2ed573" };
          case 'goodEnough': return { label: "GOOD ENOUGH", color: "#ffa502" };
          case 'skipIt': return { label: "SKIP IT", color: "#ff4757" };
          case 'masterpiece': return { label: "MASTERPIECE", color: "#a855f7" };
          default: return { label: "NO VERDICT", color: "#666" };
      }
  };

  const getMetacriticColor = (score) => {
    if (!score) return "bg-[#333] text-[var(--text-muted)]";
    if (score >= 85) return "bg-[rgba(46,213,115,0.15)] text-[#2ed573] border border-[rgba(46,213,115,0.3)]";
    if (score >= 70) return "bg-[rgba(255,165,2,0.15)] text-[#ffa502] border border-[rgba(255,165,2,0.3)]";
    return "bg-[rgba(255,71,87,0.15)] text-[#ff4757] border border-[rgba(255,71,87,0.3)]";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-16 font-inter pb-24">
      <SEO 
        title={game.name} 
        description={`Read player verdicts and reviews for ${game.name}. Is it a Must Play or a Skip? Find out on GRIDLOCK.`}
        image={game.background_image}
        url={`/game/${gameId}`}
      />
      
      {/* TRAILER BANNER - CLICKABLE FOR FULLSCREEN */}
      {trailer && trailer.data && trailer.data.max ? (
        <>
          <div 
            onClick={() => setTrailerFullscreen(true)}
            className="w-full h-[280px] md:h-[320px] bg-black relative group cursor-pointer overflow-hidden"
          >
            <video 
              src={trailer.data.max} 
              poster={trailer.preview || game.background_image}
              className="w-full h-full object-cover"
              muted
            ></video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                <div className="w-0 h-0 border-l-8 border-r-0 border-t-5 border-b-5 border-l-white border-t-transparent border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
          
          {/* Fullscreen Trailer Modal */}
          {trailerFullscreen && (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4">
              <button
                onClick={() => setTrailerFullscreen(false)}
                className="absolute top-4 right-4 text-white hover:text-[var(--accent)] transition-colors z-[201] bg-black/50 p-2 rounded-full"
              >
                <FiX size={28} />
              </button>
              <div className="w-full h-screen max-h-screen bg-black relative">
                <video 
                  src={trailer.data.max} 
                  poster={trailer.preview || game.background_image}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                ></video>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-[280px] md:h-[320px] bg-[#111] relative overflow-hidden">
          <img 
            src={game.background_image} 
            alt={game.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mx-auto mb-4">
                <FiArrowRight size={24} className="text-white/50 ml-1" />
              </div>
              <p className="text-white/60 text-sm">No trailer available</p>
            </div>
          </div>
        </div>
      )}

      {/* GAME INFO SECTION - BELOW TRAILER */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 mb-8">
          {/* POSTER */}
          <div className="w-full md:w-[200px] mx-auto md:mx-0">
            <div className="aspect-[3/4] bg-[#222] rounded-xl overflow-hidden border-2 border-[#333] shadow-2xl">
              <img src={game.background_image_additional || game.background_image} alt="Cover" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* GAME DETAILS */}
          <div className="flex flex-col justify-start">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {game.parent_platforms?.slice(0, 4).map((p) => (
                <span key={p.platform.id} className="text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/90 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                  {p.platform.name}
                </span>
              ))}
            </div>
            
            <h1 className="font-syne text-[42px] md:text-[56px] font-black leading-tight tracking-tight mb-6">{game.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-8">
              {game.metacritic && (
                <div className={`px-4 py-2 rounded-lg font-bold text-[18px] flex items-center gap-2 ${getMetacriticColor(game.metacritic)}`}>
                  {game.metacritic} 
                  <span className="text-[11px] font-normal uppercase tracking-wider opacity-80">Metacritic</span>
                </div>
              )}
              {game.released && (
                <span className="flex items-center gap-2 text-[15px] text-white/80">
                  <FiCalendar className="opacity-60"/> 
                  {new Date(game.released).getFullYear()}
                </span>
              )}
              {game.developers?.[0] && (
                <span className="flex items-center gap-2 text-[15px] text-white/80">
                  <FiBriefcase className="opacity-60"/> 
                  {game.developers[0].name}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="group transition-transform hover:scale-105 active:scale-95 duration-200">
                <AddToShelfButton 
                  game={{ id: game.id, name: game.name, cover: game.background_image }} 
                  currentStatus={userShelfStatus} 
                  onStatusChange={setUserShelfStatus} 
                />
              </div>

              <button 
                onClick={() => user ? setShowReviewModal(true) : addToast("Sign in to write review", "error")}
                className="h-12 px-8 bg-[#161616] text-white hover:bg-[#222] border border-[#2a2a2a] font-bold text-[14px] transition-colors rounded-lg"
              >
                Write Review
              </button>

              <button onClick={handleShare} className="h-12 w-12 rounded-lg bg-[#161616] border border-[#2a2a2a] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-[#444] transition-all hover:bg-[#222]">
                <FiShare2 size={18} aria-hidden="true" />
              </button>
            </div>

            {/* DESCRIPTION */}
            {game.description_raw && (
              <p className="text-[15px] text-white/80 leading-relaxed line-clamp-4">
                {game.description_raw}
              </p>
            )}
          </div>
        </div>

        {/* GENRES */}
        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {game.genres.map(g => (
              <span key={g.id} className="bg-[#161616] text-[12px] px-4 py-2 rounded-lg border border-[#2a2a2a] text-white/90 hover:border-[var(--accent)] transition-all">
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
        
        {/* LEFT COLUMN - REVIEWS & DETAILS */}
        <div className="space-y-12">

          {/* GAMEMETER SECTION - ENHANCED & CLICKABLE */}
          <section className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-[16px] p-8 md:p-12 relative overflow-hidden sticky top-20 z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] filter blur-[100px] opacity-[0.05] pointer-events-none"></div>
            
            <div className="mb-8">
              <span className="inline-block bg-[#1a1a1a] text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold px-4 py-2 rounded-full mb-6 border border-[#2a2a2a]">
                Community Verdict
              </span>
              
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0 mb-4">
                <div>
                  <h2 className="font-syne text-[48px] md:text-[64px] font-black leading-none mb-2">
                    {verdictStats.total > 0 ? Math.round((Math.max(verdictStats.mustPlay, verdictStats.goodEnough, verdictStats.skipIt, verdictStats.masterpiece) / verdictStats.total) * 100) : 0}%
                  </h2>
                  <h3 className="font-syne text-[24px] font-black leading-none">
                    {dominantVerdict ? (
                      <span style={{color: getVerdictMetadata(dominantVerdict).color}}>
                        {getVerdictMetadata(dominantVerdict).label}
                      </span>
                    ) : "NOT ENOUGH VOTES"}
                  </h3>
                </div>
                <p className="text-[14px] text-[var(--text-muted)]">
                  Based on <span className="font-bold text-white">{verdictStats.total.toLocaleString()}</span> player votes
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 'masterpiece', label: "Perfection", color: "#a855f7", icon: HiSparkles },
                { id: 'mustPlay', label: "Go for it", color: "#2ed573", icon: HiHandThumbUp },
                { id: 'goodEnough', label: "Timepass", color: "#ffa502", icon: HiMinus },
                { id: 'skipIt', label: "Skip", color: "#ff4757", icon: HiHandThumbDown },
              ].map(v => {
                const count = verdictStats[v.id] || 0;
                const percent = verdictStats.total > 0 ? Math.round((count / verdictStats.total) * 100) : 0;
                const isUserVote = userVerdict === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => user ? setShowVerdictModal(true) : addToast("Sign in to vote", "error")}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all border ${
                      isUserVote
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[#222] hover:border-[#333] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-[140px] text-[14px] font-medium flex-shrink-0">
                      <v.icon size={18} aria-hidden="true" style={{color: v.color}} />
                      <span className="text-white">{v.label}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percent}%`, backgroundColor: v.color }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right w-[50px] text-[13px] font-bold text-white">
                      {percent}%
                    </div>
                    {isUserVote && (
                      <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent)] text-black">
                        Your Vote
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* TRAILER ALTERNATIVE (if screenshots show) */}
          {screenshots.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="font-syne text-[28px] font-bold">Gallery</h3>
                <div className="h-px bg-[#222] flex-1"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screenshots.slice(0, 6).map((img, idx) => (
                  <div 
                    key={img.id} 
                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                    className="aspect-video rounded-lg overflow-hidden cursor-pointer group relative"
                  >
                    <img src={img.image} alt="Screenshot" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* COMMUNITY REVIEWS */}
          <section id="reviews">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="font-syne text-[28px] font-bold">Player Reviews</h3>
              {reviews.length > 0 && <span className="bg-[#222] text-[var(--text-muted)] text-[12px] px-4 py-2 rounded-full font-bold">{reviews.length}</span>}
              <div className="h-px bg-[#222] flex-1"></div>
            </div>

            {reviewsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-40 bg-[#161616] rounded-xl border border-[#222]"></div>)}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-5">
                {reviews.map(review => (
                  <div key={review.id} className="bg-[#161616] border border-[#222] rounded-[14px] p-6 transition-all hover:border-[#333] hover:bg-[#1a1a1a]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] flex items-center justify-center font-bold text-black border-2 border-black object-cover overflow-hidden flex-shrink-0">
                          {review.avatar ? <img src={review.avatar} alt="Avatar" className="w-full h-full object-cover"/> : review.displayName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[15px] text-white truncate">{review.displayName}</div>
                          <div className="text-[var(--text-muted)] text-[12px]">@{review.username} • {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}</div>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border flex-shrink-0 ml-4`}
                        style={{ 
                          borderColor: `${getVerdictMetadata(review.verdict).color}40`,
                          backgroundColor: `${getVerdictMetadata(review.verdict).color}15`,
                          color: getVerdictMetadata(review.verdict).color
                        }}>
                        {getVerdictMetadata(review.verdict).label}
                      </div>
                    </div>

                    {review.reviewText && (
                      <p className="text-[15px] text-[#ddd] leading-[1.6] mb-4">
                        {review.reviewText.length > 300 ? `${review.reviewText.substring(0, 300)}...` : review.reviewText}
                      </p>
                    )}

                    <div className="pt-4 border-t border-[#222] flex items-center gap-6">
                      <button className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] hover:text-[#2ed573] transition-colors font-medium">
                        <HiHandThumbUp size={14} aria-hidden="true" /> Helpful ({(review.likes || []).length})
                      </button>
                      <button className="text-[12px] text-[#666] hover:text-[#ff4757] transition-colors ml-auto">
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<BiJoystick size={48} />} 
                title="No reviews yet" 
                subtitle="Be the first player to share your thoughts on this game."
                ctaText={<>Write a Review <FiArrowRight size={16} aria-hidden="true" /></>} 
                onCtaClick={() => user ? setShowReviewModal(true) : addToast("Sign in to review", "error")}
              />
            )}
          </section>

        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="space-y-8 lg:pl-4 border-l-0 lg:border-l lg:border-[#1e1e1e]">
          
          {/* ABOUT */}
          <section className="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-6">
            <h4 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-5 pb-3 border-b border-[#222]">About the game</h4>
            
            <div className="text-[13px] text-[#bbb] leading-relaxed mb-6">
              {game.description_raw ? (
                <p className="line-clamp-5">{game.description_raw}</p>
              ) : "No description provided."}
            </div>

            <div className="space-y-5">
              {game.developers?.[0] && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Developer</div>
                  <div className="text-[13px] text-white">{game.developers[0].name}</div>
                </div>
              )}
              {game.publishers?.[0] && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Publisher</div>
                  <div className="text-[13px] text-white">{game.publishers[0].name}</div>
                </div>
              )}
              {game.released && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Release Date</div>
                  <div className="text-[13px] text-white">{new Date(game.released).toLocaleDateString()}</div>
                </div>
              )}
              {game.playtime > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Avg Playtime</div>
                  <div className="text-[13px] text-white">{game.playtime} hours</div>
                </div>
              )}
            </div>
          </section>

          {/* WHERE TO PLAY */}
          {game.stores && game.stores.length > 0 && (
            <section className="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-6">
              <h4 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4 pb-3 border-b border-[#222]">Where to play</h4>
              <div className="space-y-3">
                {game.stores.slice(0, 5).map((s) => (
                  <a key={s.store.id} href={`https://${s.store.domain}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-[#161616] border border-[#222] rounded-lg hover:border-[var(--accent)] hover:bg-[#1a1a1a] transition-all group">
                    <div className="text-[13px] font-medium group-hover:text-[var(--accent)]">{s.store.name}</div>
                    <FiArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* RATING */}
          {game.esrb_rating && (
            <section className="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-6">
              <h4 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4">Rating</h4>
              <div className="bg-[#161616] border-2 border-[var(--accent)] rounded-lg px-4 py-3 text-center">
                <div className="font-bold text-[14px] text-white">{game.esrb_rating.name}</div>
              </div>
            </section>
          )}

        </div>
      </div>

      {lightboxOpen && (
        <Lightbox 
          images={screenshots} 
          currentIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)}
          onNavigate={(dir) => {
            if (dir === 'next') setLightboxIndex(i => (i + 1) % screenshots.length);
            if (dir === 'prev') setLightboxIndex(i => (i - 1 + screenshots.length) % screenshots.length);
          }}
        />
      )}

      {showVerdictModal && (
        <VerdictModal 
          game={{ id: game.id, name: game.name, cover: game.background_image }}
          currentVerdict={userVerdict}
          onClose={() => setShowVerdictModal(false)}
          onSuccess={(verdict) => {
            setUserVerdict(verdict);
          }}
        />
      )}

      {showReviewModal && (
        <WriteReviewModal
          game={{ id: game.id, name: game.name, cover: game.background_image }}
          onClose={() => setShowReviewModal(false)}
          onSuccess={(reviewId) => {
            window.location.reload(); 
          }}
        />
      )}

    </div>
  );
}
