import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaGlobeAmericas, FaLock, FaArrowLeft } from "react-icons/fa";

export default function CreateCollection() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
        setError("Title is required");
        return;
    }

    setLoading(true);
    setError("");

    try {
        const newCollection = {
            uid: user.uid,
            username: userProfile?.username || user.uid.slice(0, 8),
            title: title.trim(),
            description: description.trim(),
            coverImage: "",
            games: [],
            isPublic: isPublic,
            createdAt: new Date().toISOString(),
            likes: 0
        };

        const docRef = await addDoc(collection(db, "collections"), newCollection);
        addToast("Collection created", "success");
        navigate(`/collections/${docRef.id}`);

    } catch (err) {
        console.error("Error creating collection:", err);
        setError("Failed to create collection.");
        addToast("Error creating collection", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px] pb-16">
        <div className="max-w-[700px] mx-auto px-4 py-8 md:py-16">
             <Link to="/collections" className="text-[12px] uppercase tracking-widest text-[var(--text-muted)] hover:text-white font-bold flex items-center gap-2 mb-8 transition-colors">
                  <FaArrowLeft /> Back to Collections
             </Link>

             <h1 className="font-syne text-[36px] md:text-[48px] font-black leading-none mb-4">Create Collection</h1>
             <p className="text-[var(--text-muted)] text-[16px] mb-10">Start a new list, then add games to it.</p>

             <form onSubmit={handleSubmit} className="space-y-6">
                 
                 <div className="flex flex-col gap-2">
                     <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Collection Title*</label>
                     <input
                         type="text"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         placeholder="e.g., Best PS2 Games of All Time"
                         required
                         className="bg-[#111] border border-[#2a2a2a] rounded-[10px] h-14 px-4 text-[16px] font-medium focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[rgba(232,255,71,0.1)] transition-all placeholder:text-[#444]"
                     />
                 </div>

                 <div className="flex flex-col gap-2">
                     <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Description (Optional)</label>
                     <textarea
                         value={description}
                         onChange={(e) => setDescription(e.target.value)}
                         placeholder="What's this list about?"
                         className="bg-[#111] border border-[#2a2a2a] rounded-[10px] min-h-[120px] p-4 text-[15px] focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[rgba(232,255,71,0.1)] transition-all placeholder:text-[#444] resize-y"
                         maxLength={500}
                     />
                     <div className="text-right text-[12px] text-[#555]">{description.length}/500</div>
                 </div>

                 <div className="flex flex-col gap-3">
                     <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-1">Visibility</label>
                     
                     <div className="flex gap-4">
                         <button
                            type="button"
                            onClick={() => setIsPublic(true)}
                            className={`flex flex-col flex-1 items-start gap-2 p-4 rounded-xl border-2 transition-all ${
                                isPublic 
                                    ? 'border-[var(--accent)] bg-[rgba(232,255,71,0.05)]' 
                                    : 'border-[#2a2a2a] bg-[#111] text-[#888] hover:border-[#444]'
                            }`}
                         >
                            <div className="flex items-center gap-2 font-bold text-[15px] text-white">
                                <FaGlobeAmericas /> Public
                            </div>
                            <span className="text-[12px] text-left leading-relaxed">Visible to everyone on your profile and search.</span>
                         </button>

                         <button
                            type="button"
                            onClick={() => setIsPublic(false)}
                            className={`flex flex-col flex-1 items-start gap-2 p-4 rounded-xl border-2 transition-all ${
                                !isPublic 
                                    ? 'border-[var(--accent)] bg-[rgba(232,255,71,0.05)]' 
                                    : 'border-[#2a2a2a] bg-[#111] text-[#888] hover:border-[#444]'
                            }`}
                         >
                             <div className="flex items-center gap-2 font-bold text-[15px] text-white">
                                 <FaLock /> Private
                             </div>
                             <span className="text-[12px] text-left leading-relaxed">Only you can see this collection.</span>
                         </button>
                     </div>
                 </div>

                 {error && <div className="text-[#ff4757] text-[13px] bg-red-500/10 border border-red-500/20 p-3 rounded-md">{error}</div>}

                 <div className="pt-8 border-t border-[#1e1e1e] flex gap-4">
                     <button
                        type="button"
                        onClick={() => navigate('/collections')}
                        className="h-12 px-6 bg-transparent border border-[#333] hover:bg-white/5 font-syne font-bold rounded-lg transition-all"
                     >
                         Cancel
                     </button>
                     <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="h-12 px-8 flex-1 bg-[var(--accent)] text-black font-syne font-bold rounded-[8px] transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                         {loading ? (
                             <>
                              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                              Creating...
                             </>
                         ) : "Create Collection →"}
                     </button>
                 </div>

             </form>
        </div>
    </div>
  );
}
