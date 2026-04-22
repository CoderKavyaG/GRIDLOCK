import { useState } from "react";
import { HiSparkles, HiHandThumbUp, HiMinus, HiHandThumbDown } from "react-icons/hi2";
import { FaPlay, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function VerdictMeter({ game, verdictStats, dominantVerdict, userVerdict, onVoteSuccess, onShelfStatusChange }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [votingVerdict, setVotingVerdict] = useState(null);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [localVerdictStats, setLocalVerdictStats] = useState(verdictStats);
  const [localUserVerdict, setLocalUserVerdict] = useState(userVerdict);
  const [localDominantVerdict, setLocalDominantVerdict] = useState(dominantVerdict);
  const [submittingShelfStatus, setSubmittingShelfStatus] = useState(null);
  const verdictConfig = [
    { id: 'masterpiece', label: "Perfection", color: "#a855f7", icon: HiSparkles },
    { id: 'mustPlay', label: "Go for it", color: "#2ed573", icon: HiHandThumbUp },
    { id: 'goodEnough', label: "Timepass", color: "#ffa502", icon: HiMinus },
    { id: 'skipIt', label: "Skip", color: "#ff4757", icon: HiHandThumbDown },
  ];

  const handleCastVote = async (verdictId) => {
    if (!user) {
      addToast("Sign in to cast your verdict", "error");
      return;
    }

    setSubmittingVote(true);
    setVotingVerdict(verdictId);

    try {
      // Update local state immediately for instant UI feedback
      const updatedStats = { ...localVerdictStats };
      
      // Decrease count of old verdict if user had one
      if (localUserVerdict && updatedStats[localUserVerdict] > 0) {
        updatedStats[localUserVerdict]--;
      }
      
      // Increase count of new verdict
      updatedStats[verdictId] = (updatedStats[verdictId] || 0) + 1;
      updatedStats.total = (updatedStats.total || 0) + (localUserVerdict ? 0 : 1);
      
      // Calculate new dominant verdict
      let maxVerdict = null;
      let maxCount = 0;
      for (const [key, val] of Object.entries(updatedStats)) {
        if (key !== 'total' && val > maxCount) {
          maxCount = val;
          maxVerdict = key;
        }
      }
      
      // Update local state
      setLocalVerdictStats(updatedStats);
      setLocalUserVerdict(verdictId);
      setLocalDominantVerdict(maxVerdict);

      // Save to Firebase
      const voteRef = doc(db, "votes", `${user.uid}_${game.id}`);
      await setDoc(voteRef, {
        uid: user.uid,
        gameId: game.id,
        verdict: verdictId,
        updatedAt: new Date().toISOString(),
      });

      addToast("Verdict saved!", "success");
      if (onVoteSuccess) {
        onVoteSuccess(verdictId);
      }
    } catch (err) {
      console.error("Error casting verdict:", err);
      // Revert local state on error
      setLocalVerdictStats(verdictStats);
      setLocalUserVerdict(userVerdict);
      setLocalDominantVerdict(dominantVerdict);
      addToast("Failed to save verdict", "error");
    } finally {
      setSubmittingVote(false);
      setVotingVerdict(null);
    }
  };

  const handleShelfStatus = async (status) => {
    if (!user) {
      addToast("Sign in to add to shelf", "error");
      return;
    }

    setSubmittingShelfStatus(status);

    try {
      const shelfRef = doc(db, `gameShelf/${user.uid}/games/${game.id}`);
      await setDoc(shelfRef, {
        gameId: game.id,
        gameName: game.name || "Game",
        gameCover: game.cover || "",
        status: status,
        addedAt: new Date().toISOString()
      }, { merge: true });

      addToast(`Added to shelf as "${status}"`, "success");
      if (onShelfStatusChange) {
        onShelfStatusChange(status);
      }
    } catch (err) {
      console.error("Error updating shelf:", err);
      addToast("Failed to update shelf", "error");
    } finally {
      setSubmittingShelfStatus(null);
    }
  };

  const total = localVerdictStats.total || 0;
  
  // Calculate angles for semicircle (180 degrees = half circle)
  const getAngle = (count) => {
    if (total === 0) return 0;
    return (count / total) * 180;
  };

  // Generate SVG path for semicircle slice
  const generateSlicePath = (startAngle, endAngle, radius = 100, innerRadius = 60) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const cos = Math.cos;
    const sin = Math.sin;

    const x1 = radius * cos(toRad(startAngle - 90));
    const y1 = radius * sin(toRad(startAngle - 90)) + radius;
    
    const x2 = radius * cos(toRad(endAngle - 90));
    const y2 = radius * sin(toRad(endAngle - 90)) + radius;
    
    const x3 = innerRadius * cos(toRad(endAngle - 90));
    const y3 = innerRadius * sin(toRad(endAngle - 90)) + radius;
    
    const x4 = innerRadius * cos(toRad(startAngle - 90));
    const y4 = innerRadius * sin(toRad(startAngle - 90)) + radius;

    const largeArc = endAngle - startAngle > 90 ? 1 : 0;
    const largeArcInner = endAngle - startAngle > 90 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcInner} 0 ${x4} ${y4}
      Z
    `;
  };

  // Calculate all slice paths
  let currentAngle = 0;
  const slices = verdictConfig.map((verdict) => {
    const count = localVerdictStats[verdict.id] || 0;
    const angle = getAngle(count);
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const path = angle > 0 ? generateSlicePath(startAngle, endAngle) : null;
    currentAngle = endAngle;
    
    return {
      ...verdict,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      path,
      angle
    };
  });

  return (
    <section className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-[16px] p-8 md:p-12 relative overflow-hidden sticky top-20 z-10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] filter blur-[100px] opacity-[0.05] pointer-events-none"></div>
      
      <div className="mb-8">
        <span className="inline-block bg-[#1a1a1a] text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold px-4 py-2 rounded-full mb-6 border border-[#2a2a2a]">
          Community Verdict
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Semicircle Meter */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[280px]">
              {total > 0 ? (
                <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-lg">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Background semicircle */}
                  <path 
                    d="M 30 110 A 70 70 0 0 1 170 110" 
                    fill="none" 
                    stroke="#1a1a1a" 
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  
                  {/* Colored slices */}
                  {slices.map((slice, idx) => (
                    slice.path && (
                      <path
                        key={idx}
                        d={slice.path}
                        fill={slice.color}
                        opacity="0.9"
                        filter="url(#glow)"
                      />
                    )
                  ))}
                  
                  {/* Center text */}
                  <text
                    x="100"
                    y="75"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="white"
                    fontFamily="monospace"
                  >
                    {localDominantVerdict ? slices.find(s => s.id === localDominantVerdict)?.count : 0}/{total}
                  </text>
                </svg>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-[#161616] rounded-full border-2 border-dashed border-[#333]">
                  <div className="text-center">
                    <p className="text-[12px] text-[#666]">No votes yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h3 className="font-syne text-[20px] font-black leading-none mb-2">
                {localDominantVerdict ? (
                  <span style={{color: slices.find(s => s.id === localDominantVerdict)?.color}}>
                    {slices.find(s => s.id === localDominantVerdict)?.label}
                  </span>
                ) : "No Consensus"}
              </h3>
              <p className="text-[13px] text-[#666] font-medium">
                Consensus among <span className="text-white font-bold">{total.toLocaleString()}</span> votes
              </p>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {slices.map(slice => (
                <div key={slice.id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  ></div>
                  <span className="text-[12px] font-medium text-[#ddd] flex-1">{slice.label}</span>
                  <span className="text-[12px] font-bold text-white">{slice.count}/{total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verdict Buttons */}
      <div className="space-y-3">
        {verdictConfig.map(v => {
          const slice = slices.find(s => s.id === v.id);
          const isUserVote = localUserVerdict === v.id;
          return (
            <button
              key={v.id}
              onClick={() => handleCastVote(v.id)}
              disabled={submittingVote}
              className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all border ${
                isUserVote
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[#222] hover:border-[#333] hover:bg-[#1a1a1a] cursor-pointer'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 w-[140px] text-[14px] font-medium flex-shrink-0">
                <v.icon size={18} aria-hidden="true" style={{color: v.color}} />
                <span className="text-white">{v.label}</span>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${slice.percent}%`, backgroundColor: v.color }}
                  ></div>
                </div>
              </div>
              <div className="text-right w-[60px] text-[13px] font-bold text-white">
                {slice.count}/{total}
              </div>
              {votingVerdict === v.id && submittingVote ? (
                <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent)] text-black flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Saving
                </div>
              ) : isUserVote ? (
                <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent)] text-black">
                  ✓ Your Vote
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Shelf Status Buttons */}
      <div className="mt-8 pt-8 border-t border-[#1e1e1e]">
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-bold mb-4">
          Add to My Shelf
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'playing', label: 'Playing', icon: FaPlay },
            { id: 'wantToPlay', label: 'Want to Play', icon: FaClock },
            { id: 'played', label: 'Played', icon: FaCheckCircle },
            { id: 'dropped', label: 'Dropped', icon: FaTimesCircle }
          ].map(status => (
            <button
              key={status.id}
              onClick={() => handleShelfStatus(status.id)}
              disabled={submittingShelfStatus !== null}
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-[#222] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all cursor-pointer disabled:opacity-50 text-[13px] font-medium"
            >
              <status.icon size={16} />
              <span className="text-white">{status.label}</span>
              {submittingShelfStatus === status.id && (
                <div className="w-3 h-3 border-2 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin ml-1"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
