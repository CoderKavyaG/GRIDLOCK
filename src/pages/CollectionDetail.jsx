import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { rawg } from "../api/rawg";
import EmptyState from "../components/EmptyState";
import { FaGlobeAmericas, FaLock, FaPen, FaShareAlt, FaSearch, FaTimes, FaPlus } from "react-icons/fa";

export default function CollectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    setLoading(true);
    try {
        const docRef = doc(db, "collections", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            setCollection({ id: docSnap.id, ...docSnap.data() });
        } else {
            setCollection(null);
        }
    } catch (err) {
        console.error("Error fetching collection:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
     if (!searchQuery.trim() || !showSearch) {
         setSearchResults([]);
         return;
     }

     const searchGames = async () => {
         setSearching(true);
         try {
             const res = await fetch(rawg.searchGames(searchQuery));
             const data = await res.json();
             setSearchResults(data.results || []);
         } catch (error) {
             console.error("Search error:", error);
         } finally {
             setSearching(false);
         }
     };

     const debounceTimer = setTimeout(searchGames, 500);
     return () => clearTimeout(debounceTimer);
  }, [searchQuery, showSearch]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Collection URL copied!", "success");
  };

  const handleAddGame = async (game) => {
      if (!user || user.uid !== collection.uid) return;
      
      const newGame = {
          gameId: game.id,
          gameName: game.name,
          cover: game.background_image
      };
      
      try {
          const docRef = doc(db, "collections", collection.id);
          await updateDoc(docRef, {
              games: arrayUnion(newGame),
              updatedAt: new Date().toISOString()
          });
          
          setCollection(prev => ({
              ...prev,
              games: [...(prev.games || []), newGame]
          }));
          addToast("Game added!", "success");
          setSearchQuery("");
      } catch (err) {
          console.error("Error adding game:", err);
          addToast("Failed to add game.", "error");
      }
  };

  const handleRemoveGame = async (gameObj) => {
      if (!user || user.uid !== collection.uid) return;
      if (!window.confirm(`Remove ${gameObj.gameName} from collection?`)) return;

      try {
          const docRef = doc(db, "collections", collection.id);
          await updateDoc(docRef, {
              games: arrayRemove(gameObj),
              updatedAt: new Date().toISOString()
          });
          
          setCollection(prev => ({
              ...prev,
              games: prev.games.filter(g => g.gameId !== gameObj.gameId)
          }));
          addToast("Game removed.", "info");
      } catch (err) {
          console.error("Error removing game:", err);
      }
  };

  const handleDeleteCollection = async () => {
      if (!user || user.uid !== collection.uid) return;
      if (!window.confirm("Delete this entire collection? This cannot be undone.")) return;

      try {
          await deleteDoc(doc(db, "collections", collection.id));
          addToast("Collection deleted", "success");
          navigate("/collections");
      } catch (err) {
          console.error("Error deleting:", err);
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#0a0a0a] pt-24 animate-pulse">
              <div className="h-[300px] w-full bg-[#111]"></div>
          </div>
      );
  }

  if (!collection) {
      return (
          <div className="min-h-screen bg-[#0a0a0a] pt-[72px] flex items-center justify-center">
              <EmptyState title="Collection Not Found" subtitle="It may have been deleted or never existed." ctaText="Back to Collections" ctaLink="/collections" />
          </div>
      );
  }

  const isOwner = user?.uid === collection.uid;
  const games = collection.games || [];
  
  const coverGames = games.slice(0, 4);
  const coverGradient = "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 100%)";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[56px] md:pt-[72px] pb-24">
        
        {/* HEADER HERO */}
        <div className="w-full relative min-h-[300px] md:min-h-[400px] bg-[#111] overflow-hidden flex flex-col justify-end">
            {/* Mosaic Background */}
            <div className={`absolute inset-0 ${coverGames.length > 0 ? 'grid' : ''} ${coverGames.length >= 2 ? 'grid-cols-2' : ''} ${coverGames.length >= 4 ? 'grid-rows-2' : ''} opacity-40 mix-blend-screen`}>
               {coverGames.length > 0 ? coverGames.map((g, i) => (
                   <div key={i} className="w-full h-full relative">
                        <img src={g.cover} alt="" className="w-full h-full object-cover" />
                   </div>
               )) : (
                   <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] to-[#222]"></div>
               )}
            </div>
            
            <div className="absolute inset-0" style={{ background: coverGradient }}></div>
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Content */}
            <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 md:px-8 pb-8 md:pb-12 pt-24">
                <Link to="/collections" className="text-[11px] uppercase tracking-widest text-[#aaa] font-bold hover:text-white transition-colors mb-6 flex items-center gap-2">
                   ← Collections
                </Link>
                
                <h1 className="font-syne text-[40px] md:text-[64px] font-black leading-none drop-shadow-2xl mb-4 tracking-tight">
                    {collection.title}
                </h1>
                
                <p className="text-[15px] md:text-[16px] text-[#ccc] max-w-2xl leading-relaxed drop-shadow-md mb-6">
                    {collection.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-[#aaa]">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md text-white font-bold">
                        {collection.isPublic ? <><FaGlobeAmericas /> Public</> : <><FaLock/> Private</>}
                    </span>
                    <span className="bg-[#161616] px-3 py-1 rounded-full border border-[#2a2a2a] text-[#ddd]">
                        {games.length} GAMES
                    </span>
                    <span className="flex items-center gap-2 text-white">
                        <span className="text-[11px] uppercase tracking-wider text-[#666]">By</span>
                        <Link to={`/user/${collection.username}`} className="hover:text-[var(--accent)] font-bold transition-colors">@{collection.username}</Link>
                    </span>
                    <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-[#111] border-b border-[#1e1e1e] sticky top-[56px] md:top-[72px] z-40 py-4">
             <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-wrap items-center gap-4">
                 
                 {isOwner && (
                     <button 
                         onClick={() => setShowSearch(!showSearch)}
                         className={`h-10 px-6 font-syne font-bold rounded-lg transition-all text-[14px] flex items-center gap-2 border-2 ${showSearch ? 'bg-[#222] border-[#444] text-white' : 'bg-[var(--accent)] text-black border-transparent hover:brightness-105'}`}
                     >
                         <FaPlus /> {showSearch ? 'Done' : 'Add Games'}
                     </button>
                 )}

                 <div className="flex-1 filter-bar-placeholder"></div>

                 <button onClick={handleShare} className="h-10 px-4 bg-[#161616] border border-[#2a2a2a] rounded-lg text-white font-bold text-[13px] hover:border-[#444] transition-all flex items-center gap-2">
                     <FaShareAlt /> Share
                 </button>

                 {isOwner && (
                     <button onClick={handleDeleteCollection} className="h-10 px-4 bg-transparent border border-[#333] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 rounded-lg text-[#666] font-bold text-[13px] transition-all">
                         Delete
                     </button>
                 )}
             </div>
        </div>

        {/* MAIN BODY */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10">
            
            {/* Inline Search UI for adding games */}
            {isOwner && showSearch && (
                <div className="mb-12 bg-[#161616] p-6 rounded-2xl border border-[#2a2a2a] shadow-2xl relative animate-fade-in">
                    <button 
                       onClick={() => setShowSearch(false)}
                       className="absolute top-4 right-4 text-[#666] hover:text-white"
                    >
                        <FaTimes size={16} />
                    </button>
                    <h3 className="font-syne text-[20px] font-bold mb-4">Add games to collection</h3>
                    
                    <div className="relative max-w-xl">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search games..."
                            className="bg-[#0f0f0f] border border-[#333] h-12 rounded-lg pl-12 pr-4 w-full text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all"
                            autoFocus
                        />
                         {searching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-transparent border-t-[var(--accent)] rounded-full animate-spin"></div>}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-4 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] max-h-[300px] overflow-y-auto">
                            {searchResults.map(res => {
                                const isAdded = games.some(g => g.gameId === res.id);
                                return (
                                    <div key={res.id} className="flex items-center gap-4 p-3 border-b border-[#1e1e1e] last:border-b-0 hover:bg-[#1a1a1a] transition-colors">
                                        <img src={res.background_image} alt="" className="w-10 h-10 rounded object-cover shadow bg-[#222]" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-[14px] truncate">{res.name}</div>
                                            <div className="text-[12px] text-[var(--text-muted)]">{new Date(res.released).getFullYear() || "N/A"}</div>
                                        </div>
                                        <button
                                           onClick={() => handleAddGame(res)}
                                           disabled={isAdded}
                                           className={`h-8 px-4 rounded-md text-[12px] font-bold transition-all ${
                                               isAdded 
                                                   ? 'bg-[#222] text-[#666] cursor-not-allowed' 
                                                   : 'bg-[#fff] text-black hover:bg-[var(--accent)]'
                                           }`}
                                        >
                                           {isAdded ? "Added" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Games Grid */}
            {games.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {games.map(game => (
                         <div key={game.gameId} className="group relative">
                             <Link to={`/game/${game.gameId}`}>
                                 <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#222] group-hover:border-[var(--accent)] transition-all relative">
                                     <img src={game.cover} alt={game.gameName} className="w-full h-full object-cover" />
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                         <div className="font-bold text-[14px] text-white leading-tight drop-shadow-md">{game.gameName}</div>
                                     </div>
                                 </div>
                             </Link>
                             {isOwner && (
                                 <button 
                                     onClick={() => handleRemoveGame(game)}
                                     className="absolute top-2 right-2 w-8 h-8 bg-black/80 backdrop-blur-md text-[#ff4757] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff4757] hover:text-white transition-all scale-75 hover:scale-100 z-10 border border-[#333]"
                                     title="Remove from collection"
                                 >
                                     <FaTimes size={12} />
                                 </button>
                             )}
                         </div>
                    ))}
                </div>
            ) : (
                <EmptyState 
                   icon="📋"
                   title="Empty Collection"
                   subtitle={isOwner ? "This collection needs some heat. Add games to get started." : "This collection doesn't have any games yet."}
                   ctaText={isOwner && !showSearch ? "Add Games +" : null}
                   onCtaClick={() => setShowSearch(true)}
                />
            )}
        </div>
    </div>
  );
}
