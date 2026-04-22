import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { rawg } from "../api/rawg";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";
import AddToShelfButton from "../components/AddToShelfButton";
import WriteReviewModal from "../components/WriteReviewModal";
import VerdictMeter from "../components/VerdictMeter";
import Lightbox from "../components/Lightbox";
import EmptyState from "../components/EmptyState";
import { FiShare2, FiCalendar, FiBriefcase, FiArrowRight, FiX } from "react-icons/fi";
import { HiHandThumbUp } from "react-icons/hi2";
import { BiJoystick } from "react-icons/bi";

export default function GameDetail() {
  const { gameId } = useParams();
  const { user, userProfile } = useAuth();
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
  const [verdictOnlyEntries, setVerdictOnlyEntries] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [trailerFullscreen, setTrailerFullscreen] = useState(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedReview, setExpandedReview] = useState(null);
  const [reviewComments, setReviewComments] = useState({});
  const [newCommentText, setNewCommentText] = useState({});

  // Function to refetch all Firebase data (reviews, verdicts, user votes)
  const refetchFirebaseData = async () => {
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
      const reviewUserIds = new Set();
      const stats = { mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0, total: 0 };
      
      // Collect user IDs from reviews for later comparison
      reviewDocs.forEach(doc => {
          const data = doc.data();
          fetchedReviews.push({ id: doc.id, ...data });
          if (data.uid) reviewUserIds.add(data.uid);
      });
      
      setReviews(fetchedReviews);

      // First, count all votes and create verdict-only entries
      const verdictOnlyList = [];
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
          
          // Check if this vote doesn't have a review
          if (data.uid && !reviewUserIds.has(data.uid)) {
            verdictOnlyList.push({
              id: doc.id,
              ...data,
              isVerdictOnly: true,
              createdAt: data.createdAt || new Date()
            });
          }
        });
        
        // Fetch user data for verdict-only entries
        for (let entry of verdictOnlyList) {
          try {
            const userRef = doc(db, "users", entry.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              entry.userData = userDoc.data();
            }
          } catch (err) {
            console.warn("Failed to fetch user data for verdict entry:", err);
          }
        }
        
        setVerdictOnlyEntries(verdictOnlyList);
      } catch (votesErr) {
        console.warn("Failed to fetch votes:", votesErr);
      }

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
    }
  };

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
    if (gameId) {
      setReviewsLoading(true);
      refetchFirebaseData().then(() => setReviewsLoading(false));
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

  const fetchReviewComments = async (reviewId) => {
    try {
      const cRef = collection(db, `reviews/${reviewId}/comments`);
      const q = query(cRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const comments = [];
      snapshot.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      
      setReviewComments(prev => ({ ...prev, [reviewId]: comments }));
    } catch (err) {
      console.error("Error fetching review comments:", err);
    }
  };

  const handlePostReviewComment = async (reviewId) => {
    if (!user) {
      addToast("Sign in to comment", "error");
      return;
    }
    
    const commentText = newCommentText[reviewId];
    if (!commentText || !commentText.trim()) return;

    try {
      const cRef = collection(db, `reviews/${reviewId}/comments`);
      const newComment = {
        uid: user.uid,
        username: user.username || userProfile?.username || "Player",
        avatar: userProfile?.avatar || "",
        displayName: userProfile?.displayName || user.displayName || "Player",
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        likes: 0
      };
      
      await addDoc(cRef, newComment);
      setNewCommentText(prev => ({ ...prev, [reviewId]: "" }));
      addToast("Comment posted ✓", "success");
      await fetchReviewComments(reviewId);
    } catch (err) {
      console.error("Error posting comment:", err);
      addToast("Failed to post comment", "error");
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

          {/* GAMEMETER SECTION - WITH SEMICIRCLE VISUALIZATION */}
          <VerdictMeter 
            game={{ id: game.id, name: game.name, cover: game.background_image }}
            verdictStats={verdictStats}
            dominantVerdict={dominantVerdict}
            userVerdict={userVerdict}
            onVoteSuccess={() => refetchFirebaseData()}
            onShelfStatusChange={() => refetchFirebaseData()}
          />

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
              {(reviews.length + verdictOnlyEntries.length) > 0 && <span className="bg-[#222] text-[var(--text-muted)] text-[12px] px-4 py-2 rounded-full font-bold">{reviews.length + verdictOnlyEntries.length}</span>}
              <div className="h-px bg-[#222] flex-1"></div>
            </div>

            {reviewsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-40 bg-[#161616] rounded-xl border border-[#222]"></div>)}
              </div>
            ) : reviews.length > 0 || verdictOnlyEntries.length > 0 ? (
              <div className="space-y-5">
                {reviews.map(review => (
                  <div key={review.id}>
                    <div className="bg-[#161616] border border-[#222] rounded-[14px] p-6 transition-all hover:border-[#333] hover:bg-[#1a1a1a]">
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
                        <button 
                          onClick={() => {
                            if (expandedReview === review.id) {
                              setExpandedReview(null);
                            } else {
                              setExpandedReview(review.id);
                              if (!reviewComments[review.id]) {
                                fetchReviewComments(review.id);
                              }
                            }
                          }}
                          className="text-[12px] text-[#666] hover:text-white transition-colors font-medium"
                        >
                          {expandedReview === review.id ? "Hide" : "Comments"}
                        </button>
                        <button className="text-[12px] text-[#666] hover:text-[#ff4757] transition-colors ml-auto">
                          Report
                        </button>
                      </div>
                    </div>

                    {/* COMMENTS SECTION */}
                    {expandedReview === review.id && (
                      <div className="bg-[#0f0f0f] border border-[#222] border-t-0 rounded-b-[14px] p-6 space-y-4">
                        {/* Comment Input */}
                        {user ? (
                          <div className="flex gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] flex items-center justify-center font-bold text-black text-sm border-2 border-black overflow-hidden flex-shrink-0">
                              {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover"/> : user.displayName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <textarea 
                                value={newCommentText[review.id] || ""}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                placeholder="Share your thoughts on this review..."
                                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg p-3 text-[13px] focus:outline-none focus:border-[var(--accent)] transition-all resize-none min-h-[80px] placeholder:text-[#555]"
                              ></textarea>
                              <div className="flex justify-end gap-2 mt-2">
                                <button 
                                  onClick={() => setNewCommentText(prev => ({ ...prev, [review.id]: "" }))}
                                  className="px-4 h-9 text-[12px] font-bold text-[#666] hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handlePostReviewComment(review.id)}
                                  disabled={!newCommentText[review.id] || !newCommentText[review.id].trim()}
                                  className="px-4 h-9 bg-[var(--accent)] text-black font-bold rounded-lg text-[12px] transition-all hover:brightness-105 disabled:opacity-50"
                                >
                                  Comment
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-[#666]">
                            <p className="text-[12px] mb-2">Sign in to comment</p>
                          </div>
                        )}

                        {/* Comments List */}
                        {reviewComments[review.id] && reviewComments[review.id].length > 0 ? (
                          <div className="space-y-3 pt-4 border-t border-[#222]">
                            {reviewComments[review.id].map(comment => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] flex items-center justify-center font-bold text-black text-xs border border-black overflow-hidden flex-shrink-0">
                                  {comment.avatar ? <img src={comment.avatar} alt="Avatar" className="w-full h-full object-cover"/> : comment.displayName?.charAt(0) || "?"}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[12px] font-bold text-white">{comment.displayName || comment.username}</span>
                                    <span className="text-[10px] text-[#666]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[12px] text-[#ddd] leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-[#666]">
                            <p className="text-[12px]">No comments yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* VERDICT-ONLY ENTRIES */}
                {verdictOnlyEntries.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-[#222]">
                    <h4 className="text-[14px] font-bold text-[var(--text-muted)] mb-4 uppercase tracking-wider">Verdicts without reviews</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {verdictOnlyEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(entry => (
                        <div key={entry.id} className="bg-[#161616] border border-[#222] rounded-[12px] p-4 transition-all hover:border-[#333] hover:bg-[#1a1a1a]">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[#a855f7] flex items-center justify-center font-bold text-black text-sm border-2 border-black object-cover overflow-hidden flex-shrink-0">
                              {entry.userData?.avatar ? <img src={entry.userData.avatar} alt="Avatar" className="w-full h-full object-cover"/> : (entry.userData?.displayName || entry.username)?.charAt(0) || "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[13px] text-white truncate">{entry.userData?.displayName || entry.displayName || entry.username}</div>
                              <div className="text-[var(--text-muted)] text-[11px]">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Recently'}</div>
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-block`}
                            style={{ 
                              borderColor: `${getVerdictMetadata(entry.verdict).color}40`,
                              backgroundColor: `${getVerdictMetadata(entry.verdict).color}15`,
                              color: getVerdictMetadata(entry.verdict).color
                            }}>
                            {getVerdictMetadata(entry.verdict).label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {showReviewModal && (
        <WriteReviewModal
          game={{ id: game.id, name: game.name, cover: game.background_image }}
          onClose={() => setShowReviewModal(false)}
          onSuccess={(reviewId) => {
            setShowReviewModal(false);
            addToast("Review submitted! Awaiting admin approval", "success");
            refetchFirebaseData();
          }}
        />
      )}

    </div>
  );
}
