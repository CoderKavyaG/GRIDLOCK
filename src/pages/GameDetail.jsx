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
import { FiBookmark, FiShare2, FiCalendar, FiBriefcase, FiClock, FiFlag, FiArrowRight } from "react-icons/fi";
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
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch Game Details
  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const [gameRes, screensRes, moviesRes] = await Promise.all([
          fetch(rawg.gameDetails(gameId)),
          fetch(rawg.gameScreenshots(gameId)),
          fetch(rawg.gameMovies(gameId))
        ]);

        const gameData = await gameRes.json();
        const screensData = await screensRes.json();
        const moviesData = await moviesRes.json();

        setGame(gameData);
        setScreenshots(screensData.results || []);
        
        if (moviesData.results && moviesData.results.length > 0) {
          setTrailer(moviesData.results[0]);
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
        // Fetch community reviews mapped to this game
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("gameId", "==", parseInt(gameId)), orderBy("createdAt", "desc"), limit(10));
        const reviewDocs = await getDocs(q);
        
        const fetchedReviews = [];
        const stats = { mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 };
        
        reviewDocs.forEach(doc => {
            const data = doc.data();
            fetchedReviews.push({ id: doc.id, ...data });
            
            // Count for dominant verdict (Simulated from reviews right now instead of reading global "votes" collection for speed)
            if (stats[data.verdict] !== undefined) {
               stats[data.verdict]++;
               stats.total++;
            }
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
              
              // Only add to stats if their vote wasn't already in the "reviews" list to avoid double counting
              const userHasReview = fetchedReviews.some(r => r.uid === user.uid);
              if (!userHasReview && stats[voteDoc.data().verdict] !== undefined) {
                  stats[voteDoc.data().verdict]++;
                  stats.total++;
              }
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
      
      {/* HERO SECTION */}
      <div className="relative w-full h-[480px] bg-[#111]">
        <img 
          src={game.background_image} 
          alt={game.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-transparent w-full"></div>
        
        {/* Hero Content */}
        <div className="absolute bottom-[-60px] md:bottom-[-40px] left-0 right-0 z-10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-end gap-6 md:gap-10">
            {/* Poster */}
            <div className="w-[120px] md:w-[180px] aspect-[3/4] flex-shrink-0 bg-[#222] rounded-xl overflow-hidden border-4 border-[#161616] shadow-2xl relative">
               <img src={game.background_image_additional || game.background_image} alt="Cover" className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 pb-2 w-full">
              <div className="flex items-center gap-2 mb-3">
                 {game.parent_platforms?.slice(0, 4).map((p) => (
                    <span key={p.platform.id} className="text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/90 px-2 py-0.5 rounded backdrop-blur-md">
                      {p.platform.name}
                    </span>
                 ))}
                 {game.parent_platforms?.length > 4 && <span className="text-[11px] font-bold text-white/70">+{game.parent_platforms.length - 4} MORE</span>}
              </div>
              <h1 className="font-syne text-[36px] md:text-[56px] font-black leading-tight tracking-tight mb-4 drop-shadow-xl">{game.name}</h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-white/80 font-medium pb-[40px] md:pb-0">
                {game.metacritic && (
                  <span className={`px-3 py-1 rounded-md font-bold text-[16px] flex items-center gap-2 ${getMetacriticColor(game.metacritic)}`}>
                    {game.metacritic} <span className="text-[11px] font-normal uppercase tracking-wider opacity-80 mt-0.5">Metacritic</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5"><FiCalendar className="opacity-50"/> {new Date(game.released).getFullYear()}</span>
                {game.developers?.[0] && <span className="flex items-center gap-1.5"><FiBriefcase className="opacity-50"/> {game.developers[0].name}</span>}
                {game.playtime > 0 && <span className="flex items-center gap-1.5"><FiClock className="opacity-50"/> {game.playtime} hrs avg</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-[#111] border-b border-[#1e1e1e] sticky top-[64px] z-[90] py-4 mt-16 md:mt-10 backdrop-blur-md bg-opacity-90 transition-all">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-wrap items-center gap-4">
          
          <div className="group transition-transform hover:scale-105 active:scale-95 duration-200">
            <AddToShelfButton 
               game={{ id: game.id, name: game.name, cover: game.background_image }} 
               currentStatus={userShelfStatus} 
               onStatusChange={setUserShelfStatus} 
            />
          </div>

          {userVerdict ? (
            <button 
              onClick={() => setShowVerdictModal(true)}
              className="h-11 px-6 font-syne font-black rounded-lg border-2 border-[var(--accent)] flex items-center gap-2 transition-all hover:bg-[var(--accent)] hover:text-black group shadow-[0_0_20px_rgba(232,255,71,0.1)] hover:shadow-[0_0_30px_rgba(232,255,71,0.2)]"
            >
               Your Verdict: <span>{getVerdictMetadata(userVerdict).label}</span>
            </button>
          ) : (
            <button 
              onClick={() => user ? setShowVerdictModal(true) : addToast("Sign in to cast verdict", "error")}
              className="h-11 px-8 bg-white text-black hover:bg-[var(--accent)] hover:scale-105 active:scale-95 text-black font-syne font-black rounded-lg transition-all text-[13px] uppercase tracking-wider"
            >
              Cast Your Verdict
            </button>
          )}

          <button 
             onClick={() => user ? setShowReviewModal(true) : addToast("Sign in to write review", "error")}
             className="h-11 px-5 text-[var(--text-muted)] hover:text-white font-bold text-[14px] transition-colors border-2 border-transparent hover:border-[#333] rounded-lg"
          >
            Review
          </button>
          
          <div className="flex-1"></div>

          <button className="w-11 h-11 rounded-lg bg-[#161616] border border-[#2a2a2a] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-[#444] transition-all hover:bg-[#222]">
            <FiBookmark size={18} aria-hidden="true" />
          </button>
          <button onClick={handleShare} className="w-11 h-11 rounded-lg bg-[#161616] border border-[#2a2a2a] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-[#444] transition-all hover:bg-[#222]">
            <FiShare2 size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
        
        {/* MAIN REVIEWS & DETAILS */}
        <div className="space-y-16">
            
          {/* GAMEMETER SECTION */}
          <section className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-[16px] p-6 md:p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] filter blur-[100px] opacity-[0.03] pointer-events-none"></div>
             
             <div className="mb-8">
                 <span className="inline-block bg-[#1a1a1a] text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold px-3 py-1.5 rounded-full mb-4 border border-[#2a2a2a]">
                     Community GameMeter™
                 </span>
                 <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
                     <h2 className="font-syne text-[40px] font-black leading-none">
                        {dominantVerdict ? (
                            <span style={{color: getVerdictMetadata(dominantVerdict).color}}>
                                {getVerdictMetadata(dominantVerdict).label}
                            </span>
                        ) : "NO VERDICTS YET"}
                     </h2>
                 </div>
                 <p className="text-[14px] text-[var(--text-muted)] mt-2">
                     Based on {verdictStats.total} player reviews
                 </p>
             </div>

             <div className="space-y-4">
                 {[
                   { id: 'mustPlay', label: "Must Play", color: "#2ed573", icon: HiHandThumbUp },
                   { id: 'goodEnough', label: "Good Enough", color: "#ffa502", icon: HiMinus },
                   { id: 'skipIt', label: "Skip It", color: "#ff4757", icon: HiHandThumbDown },
                   { id: 'masterpiece', label: "Masterpiece", color: "#a855f7", icon: HiSparkles },
                 ].map(v => {
                     const count = verdictStats[v.id] || 0;
                     const percent = verdictStats.total > 0 ? Math.round((count / verdictStats.total) * 100) : 0;
                     return (
                         <div key={v.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative group">
                             <div className="w-[120px] text-[13px] font-medium text-[var(--text-muted)] group-hover:text-white transition-colors flex items-center gap-2">
                                 <v.icon size={14} aria-hidden="true" />
                                 <span className="flex-1">{v.label}</span>
                                 <span>{percent}%</span>
                             </div>
                             <div className="flex-1 h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#222]">
                                 <div 
                                     className="h-full rounded-full transition-all duration-1000 ease-out"
                                     style={{ width: `${percent}%`, backgroundColor: v.color }}
                                 ></div>
                             </div>
                         </div>
                     );
                 })}
             </div>
          </section>

          {/* SCREENSHOTS */}
          {screenshots.length > 0 && (
              <section>
                  <div className="flex items-center gap-4 mb-6">
                      <h3 className="font-syne text-[24px] font-bold">Screenshots</h3>
                      <div className="h-px bg-[#222] flex-1 mt-2"></div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar">
                      {screenshots.map((img, idx) => (
                          <div 
                              key={img.id} 
                              onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                              className="w-[280px] md:w-[320px] h-[160px] md:h-[180px] shrink-0 rounded-xl overflow-hidden cursor-pointer group snap-center relative"
                          >
                              <img src={img.image} alt="Screenshot" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                          </div>
                      ))}
                  </div>
              </section>
          )}

          {/* TRAILER */}
          {trailer && trailer.data && trailer.data.max && (
              <section>
                   <div className="flex items-center gap-4 mb-6">
                      <h3 className="font-syne text-[24px] font-bold">Trailer</h3>
                      <div className="h-px bg-[#222] flex-1 mt-2"></div>
                  </div>
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-[#222] bg-black">
                      <video 
                          src={trailer.data.max} 
                          controls
                          poster={trailer.preview}
                          className="w-full h-full object-cover"
                      ></video>
                  </div>
              </section>
          )}

          {/* COMMUNITY REVIEWS */}
          <section id="reviews">
              <div className="flex items-center gap-4 mb-8">
                  <h3 className="font-syne text-[24px] font-bold">Player Reviews</h3>
                  {reviews.length > 0 && <span className="bg-[#222] text-[var(--text-muted)] text-[12px] px-3 py-1 rounded-full font-bold">{reviews.length}</span>}
                  <div className="h-px bg-[#222] flex-1 mt-2"></div>
              </div>

              {reviewsLoading ? (
                  <div className="space-y-4 animate-pulse">
                      {[1,2,3].map(i => <div key={i} className="h-32 bg-[#161616] rounded-xl border border-[#222]"></div>)}
                  </div>
              ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                      {reviews.map(review => (
                          <div key={review.id} className="bg-[#161616] border border-[#222] rounded-[12px] p-5 sm:p-6 transition-all hover:border-[#333]">
                               <div className="flex items-center justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] flex items-center justify-center font-bold text-black border-2 border-black object-cover overflow-hidden">
                                          {review.avatar ? <img src={review.avatar} alt="Avatar"/> : review.displayName?.charAt(0)}
                                       </div>
                                       <div>
                                           <div className="font-bold text-[15px] {review.displayName} leading-tight text-white">{review.displayName}</div>
                                           <div className="text-[var(--text-muted)] text-[12px]">@{review.username} • {new Date(review.createdAt).toLocaleDateString()}</div>
                                       </div>
                                   </div>
                                   
                                   <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border`}
                                        style={{ 
                                            borderColor: `${getVerdictMetadata(review.verdict).color}40`,
                                            backgroundColor: `${getVerdictMetadata(review.verdict).color}15`,
                                            color: getVerdictMetadata(review.verdict).color
                                        }}>
                                       {getVerdictMetadata(review.verdict).label}
                                   </div>
                               </div>

                               {review.spoiler ? (
                                   <div className="bg-[#111] border border-[#2a2a2a] p-4 text-center rounded-lg cursor-pointer group hover:bg-[#161616] transition-colors"
                                        onClick={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                                   >
                                       <FaFlag className="text-[#ff4757] opacity-60 mx-auto mb-2" size={16} />
                                       <p className="text-[13px] text-[var(--text-muted)] group-hover:text-white transition-colors">⚠️ Spoiler Review — Click to reveal</p>
                                   </div>
                               ) : null}

                               <p className="text-[15px] text-[#ddd] leading-[1.6]" style={{ display: review.spoiler ? 'none' : 'block' }}>
                                   {review.reviewText || <span className="italic opacity-50">No written review.</span>}
                               </p>

                               <div className="mt-5 pt-4 border-t border-[#222] flex items-center gap-6">
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
                       onCtaClick={() => user ? setShowReviewModal(true) : alert("Sign in to review")}
                   />
              )}
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-10 lg:pl-4 border-l-0 lg:border-l lg:border-[#1e1e1e]">
            
            {/* ABOUT */}
            <section className="bg-[#111] border border-[#1e1e1e] rounded-[16px] p-6">
                <h4 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4 title-line">About the game</h4>
                <div className="text-[14px] text-[#bbb] leading-relaxed mb-6">
                    {game.description_raw ? (
                        <p className="line-clamp-6">{game.description_raw}</p>
                    ) : "No description provided."}
                    {game.description_raw?.length > 300 && <span className="text-[var(--accent)] cursor-pointer mt-2 block font-medium hover:underline">Read more</span>}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {game.genres?.map(g => (
                        <span key={g.id} className="bg-[#1a1a1a] text-[12px] px-3 py-1.5 rounded-md border border-[#2a2a2a] text-[#ddd]">
                            {g.name}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Developer</div>
                        <div className="text-[14px] font-medium text-white line-clamp-1">{game.developers?.[0]?.name || "N/A"}</div>
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Publisher</div>
                        <div className="text-[14px] font-medium text-white line-clamp-1">{game.publishers?.[0]?.name || "N/A"}</div>
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Release Date</div>
                        <div className="text-[14px] font-medium text-white">{new Date(game.released).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Age Rating</div>
                        <div className="text-[14px] font-medium text-white">
                            {game.esrb_rating?.name ? <span className="border border-white/20 px-1.5 py-0.5 rounded shadow-sm">{game.esrb_rating.name}</span> : "N/A"}
                        </div>
                    </div>
                </div>
            </section>

             {/* WHERE TO PLAY */}
             <section className="bg-[#111] border border-[#1e1e1e] rounded-[16px] p-6">
                 <h4 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4 title-line">Where to play</h4>
                 <div className="space-y-2">
                     {game.stores?.length > 0 ? game.stores.map((s) => (
                         <a key={s.store.id} href={`https://${s.store.domain}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-[#161616] border border-[#222] rounded-lg hover:border-[var(--accent)] hover:bg-[#1a1a1a] transition-all group">
                             <div className="text-[14px] font-medium">{s.store.name}</div>
                             <div className="text-[var(--text-muted)] text-[12px] group-hover:text-[var(--accent)] flex items-center gap-1">Get <FiArrowRight size={14} aria-hidden="true" /></div>
                         </a>
                     )) : (
                         <div className="text-[13px] text-[var(--text-muted)] italic">Store data not available.</div>
                     )}
                 </div>
             </section>

             {/* TAGS */}
             <section>
                 <h4 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                     {game.tags?.slice(0, 10).map(t => (
                         <span key={t.id} className="text-[12px] text-[#888] hover:text-white transition-colors cursor-pointer">#{t.name.toLowerCase()}</span>
                     ))}
                 </div>
             </section>

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
                 if (!dominantVerdict) { // optimistic UI update if first
                    // full reload not necessary, just update user side
                 }
             }}
          />
      )}

      {showReviewModal && (
          <WriteReviewModal
            game={{ id: game.id, name: game.name, cover: game.background_image }}
            onClose={() => setShowReviewModal(false)}
            onSuccess={(reviewId) => {
                 // Toast handled globally maybe or here
                 // Let's reload reviews or page for simplicity, or just optimistic append
                 window.location.reload(); 
            }}
          />
      )}

    </div>
  );
}
