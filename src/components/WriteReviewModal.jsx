import { useState } from "react";
import { FiX, FiArrowRight } from "react-icons/fi";
import { HiHandThumbUp, HiMinus, HiHandThumbDown, HiSparkles } from "react-icons/hi2";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

const VERDICTS = [
  { id: "mustPlay", label: "Must Play", color: "#2ed573", icon: HiHandThumbUp },
  { id: "goodEnough", label: "Good Enough", color: "#ffa502", icon: HiMinus },
  { id: "skipIt", label: "Skip It", color: "#ff4757", icon: HiHandThumbDown },
  { id: "masterpiece", label: "Masterpiece", color: "#a855f7", icon: HiSparkles },
];

export default function WriteReviewModal({ game, onClose, onSuccess }) {
  const { user, userProfile } = useAuth();
  const [selectedVerdict, setSelectedVerdict] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in to write a review.");
      return;
    }
    if (!selectedVerdict) {
      setError("Please select a verdict.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Add Review to reviews collection
      const newReview = {
        uid: user.uid,
        username: userProfile?.username || user.uid.slice(0, 8),
        avatar: userProfile?.avatar || "",
        displayName: userProfile?.displayName || userProfile?.username || "Player",
        gameId: game.id,
        gameName: game.name || "Game",
        gameCover: game.cover || "",
        verdict: selectedVerdict,
        reviewText: reviewText,
        likes: [],
        createdAt: new Date().toISOString(),
        spoiler: spoiler,
        approved: false  // Requires admin approval before showing to others
      };
      
      const docRef = await addDoc(collection(db, "reviews"), newReview);

      // 2. Also save their verdict in votes collection (upsert)
      const voteRef = doc(db, "votes", `${user.uid}_${game.id}`);
      await setDoc(voteRef, {
        uid: user.uid,
        gameId: game.id,
        verdict: selectedVerdict,
        updatedAt: new Date().toISOString()
      });

      // 3. Auto-add game to shelf as "played" since they reviewed it
      const shelfRef = doc(db, `gameShelf/${user.uid}/games/${game.id}`);
      await setDoc(shelfRef, {
        gameId: game.id,
        gameName: game.name || "Game",
        gameCover: game.cover || "",
        status: "played",
        addedAt: new Date().toISOString()
      }, { merge: true });

      onSuccess(docRef.id);
      onClose();
    } catch (err) {
      console.error("Error writing review:", err);
      setError("Failed to submit review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[8px] flex items-center justify-center p-4">
      <div 
        className="bg-[#161616] border border-[#2a2a2a] rounded-2xl max-w-[560px] w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <FiX size={20} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          {game.cover && (
            <img src={game.cover} alt="" className="w-12 h-16 object-cover rounded shadow-lg border border-[#2a2a2a]" />
          )}
          <div>
            <h2 className="font-syne text-[20px] font-bold text-white line-clamp-1">{game.name || "Game"}</h2>
            <p className="text-[14px] text-[var(--text-muted)]">Your Review</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Verdict Selector (Required) */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Your verdict</label>
            <div className="grid grid-cols-2 gap-3">
              {VERDICTS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVerdict(v.id)}
                  className={`h-12 rounded-lg border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                    selectedVerdict === v.id 
                      ? `border-transparent text-black` 
                      : `border-[#2a2a2a] text-[#ccc] hover:bg-[#222]`
                  }`}
                  style={{ 
                    backgroundColor: selectedVerdict === v.id ? v.color : 'transparent',
                  }}
                >
                  <v.icon size={18} aria-hidden="true" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review Text (Optional) */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Review (Optional)</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this game... (Professional and helpful reviews only)"
              className="bg-[#111] border border-[#2a2a2a] rounded-lg min-h-[120px] p-[14px] text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all resize-y"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-[12px] text-[var(--text-muted)]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={spoiler} 
                  onChange={(e) => setSpoiler(e.target.checked)}
                  className="accent-[var(--accent)] w-4 h-4 rounded"
                />
                My review contains spoilers
              </label>
              <span>{reviewText.length}/500</span>
            </div>
          </div>

          {error && <div className="text-[#ff4757] text-[13px]">{error}</div>}

          <button 
            type="submit"
            disabled={loading || !selectedVerdict}
            className="w-full bg-[var(--accent)] text-black font-bold font-syne h-12 rounded-[10px] transition-all hover:brightness-105 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
          >
             {loading ? (
             <>
               <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
               Submitting...
             </>
          ) : (
            <>Submit Review <FiArrowRight size={16} aria-hidden="true" /></>
          )}
          </button>

        </form>
      </div>
    </div>
  );
}
