import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FiChevronDown, FiCheck, FiPlus, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { BiJoystick } from "react-icons/bi";
import { BsCollectionPlay } from "react-icons/bs";

const SHELF_STATUS = [
  { id: "played", label: "Played", icon: <FiCheck />, color: "#2ed573" },
  { id: "playing", label: "Currently Playing", icon: <BiJoystick />, color: "#3498db" },
  { id: "wantToPlay", label: "Want to Play", icon: <BsCollectionPlay />, color: "#f39c12" },
  { id: "dropped", label: "Dropped", icon: <FiX />, color: "#e74c3c" },
];

export default function AddToShelfButton({ game, currentStatus, onStatusChange }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStatus = async (statusId) => {
    setIsOpen(false);
    if (!user) return; // Should not happen if correctly rendered
    
    setLoading(true);
    try {
      const shelfRef = doc(db, `gameShelf/${user.uid}/games/${game.id}`);
      await setDoc(shelfRef, {
        gameId: game.id,
        gameName: game.name,
        coverImage: game.cover || game.background_image || "",
        status: statusId,
        addedAt: currentStatus ? undefined : new Date().toISOString(), // Only set addedAt if new
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const statusObj = SHELF_STATUS.find(s => s.id === statusId);
      addToast(`Moved to ${statusObj.label}`, "success");
      onStatusChange(statusId);
      
    } catch (error) {
      console.error("Error updating shelf:", error);
      addToast("Failed to update shelf", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Link 
        to="/login"
        className="h-10 px-4 bg-[var(--accent)] text-black font-syne font-bold rounded-lg hover:brightness-105 transition-all text-[14px] items-center inline-flex gap-2"
      >
        <FiPlus size={16} aria-hidden="true" /> Add to Shelf
      </Link>
    );
  }

  const currentStatusObj = SHELF_STATUS.find(s => s.id === currentStatus);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`h-10 px-4 font-syne font-bold rounded-lg transition-all text-[14px] flex items-center gap-2 ${
          currentStatusObj 
            ? 'bg-[#222] text-white border border-[#333] hover:border-[#555]' 
            : 'bg-[var(--accent)] text-black hover:brightness-105'
        } disabled:opacity-70`}
      >
        {loading ? (
             <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
        ) : currentStatusObj ? (
          <>
            <span style={{ color: currentStatusObj.color }}>{currentStatusObj.icon}</span>
            {currentStatusObj.label}
            <FiChevronDown size={14} className="ml-1 opacity-70" aria-hidden="true" />
          </>
        ) : (
          <><FiPlus size={16} aria-hidden="true" /> Add to Shelf</>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#161616] border border-[#2a2a2a] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[220px] p-2 z-[90]">
          {SHELF_STATUS.map(status => (
            <button
              key={status.id}
              onClick={() => handleSelectStatus(status.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-[14px] font-medium transition-colors ${
                currentStatus === status.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-[16px] w-5 flex justify-center" style={{ color: status.color }}>
                {status.icon}
              </span>
              {status.label}
              {currentStatus === status.id && <FiCheck className="ml-auto text-white/50" size={12} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
