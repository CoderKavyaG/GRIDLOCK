import { useState } from "react";
import { FiX, FiArrowRight } from "react-icons/fi";
import { HiHandThumbUp, HiMinus, HiHandThumbDown, HiSparkles } from "react-icons/hi2";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

const VERDICTS = [
  { id: "mustPlay", label: "Must Play", color: "#2ed573", icon: HiHandThumbUp },
  { id: "goodEnough", label: "Good Enough", color: "#ffa502", icon: HiMinus },
  { id: "skipIt", label: "Skip It", color: "#ff4757", icon: HiHandThumbDown },
  { id: "masterpiece", label: "Masterpiece", color: "#a855f7", icon: HiSparkles },
];

export default function VerdictModal({ game, currentVerdict, onClose, onSuccess }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(currentVerdict);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in to cast a verdict.");
      return;
    }
    if (!selected) {
      setError("Please select a verdict.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const voteRef = doc(db, "votes", `${user.uid}_${game.id}`);
      await setDoc(voteRef, {
        uid: user.uid,
        gameId: game.id,
        verdict: selected,
        updatedAt: new Date().toISOString(),
      });

      onSuccess(selected);
      onClose();
    } catch (err) {
      console.error("Error casting verdict:", err);
      setError("Failed to cast verdict. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[8px] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#161616] border border-[#2a2a2a] rounded-2xl max-w-[560px] w-full p-6 md:p-8 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <FiX size={20} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          {game.cover && (
            <img src={game.cover} alt="" className="w-12 h-16 object-cover rounded shadow-lg border border-[#2a2a2a]" />
          )}
          <div>
            <h2 className="font-syne text-[20px] font-bold text-white line-clamp-1">{game.name || "Game"}</h2>
            <p className="text-[14px] text-[var(--text-muted)]">Cast Your Verdict</p>
          </div>
        </div>

        {/* Verdict Selector */}
        <div className="flex flex-col gap-3 mb-8">
          <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Your verdict</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VERDICTS.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`h-14 rounded-[10px] border-2 flex items-center justify-center gap-3 font-bold transition-all ${
                  selected === v.id 
                    ? `border-transparent text-black` 
                    : `border-[rgba(255,255,255,0.1)] text-[#ccc] hover:bg-white/5`
                }`}
                style={{ 
                  backgroundColor: selected === v.id ? v.color : 'transparent',
                }}
              >
                <v.icon size={20} aria-hidden="true" />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-[#ff4757] text-[13px] mb-4 text-center">{error}</div>}

        <button 
          onClick={handleSubmit}
          disabled={loading || !selected || (!user && !error)}
          className="w-full bg-[var(--accent)] text-black font-bold font-syne h-12 rounded-[10px] transition-all hover:brightness-105 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
               <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
               Submitting...
             </>
          ) : (
            <>Submit Verdict <FiArrowRight size={16} aria-hidden="true" /></>
          )}
        </button>
      </div>
    </div>
  );
}
