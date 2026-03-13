import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import GameCard from "../components/GameCard";
import EmptyState from "../components/EmptyState";
import SEO from "../components/SEO";
import { FiCheck, FiX, FiGrid, FiList, FiArrowRight } from "react-icons/fi";
import { BiJoystick } from "react-icons/bi";
import { BsCollectionPlay } from "react-icons/bs";

const SHELF_TABS = [
  { id: "played", label: "Played", icon: <FiCheck />, color: "#2ed573" },
  { id: "playing", label: "Playing", icon: <BiJoystick />, color: "#3498db" },
  { id: "wantToPlay", label: "Want to Play", icon: <BsCollectionPlay />, color: "#f39c12" },
  { id: "dropped", label: "Dropped", icon: <FiX />, color: "#e74c3c" },
];

export default function GameShelf({ embedded = false, uid = null }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const targetUid = uid || user?.uid;
  
  const [activeTab, setActiveTab] = useState("played");
  const [games, setGames] = useState({ played: [], playing: [], wantToPlay: [], dropped: [] });
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [sortBy, setSortBy] = useState("addedAt");
  const [filterVerdict, setFilterVerdict] = useState("all");

  useEffect(() => {
    if (!targetUid) return;
    
    const fetchShelf = async () => {
      setLoading(true);
      try {
        const shelfRef = collection(db, `gameShelf/${targetUid}/games`);
        const snapshot = await getDocs(shelfRef);
        
        const newGames = { played: [], playing: [], wantToPlay: [], dropped: [] };
        snapshot.forEach(doc => {
           const data = doc.data();
           if (newGames[data.status]) {
               newGames[data.status].push({ id: doc.id, ...data });
           }
        });
        
        setGames(newGames);
      } catch (err) {
        console.error("Error fetching shelf:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShelf();
  }, [targetUid]);

  const handleRemove = async (gameId, e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm("Remove from shelf?")) return;
      
      try {
          await deleteDoc(doc(db, `gameShelf/${targetUid}/games/${gameId}`));
          setGames(prev => {
              const newState = { ...prev };
              newState[activeTab] = newState[activeTab].filter(g => g.id !== gameId);
              return newState;
          });
          addToast("Removed from shelf", "info");
      } catch (err) {
          console.error("Remove err:", err);
      }
  };

  const handleStatusChange = async (gameId, newStatus, gameData, e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
          await setDoc(doc(db, `gameShelf/${targetUid}/games/${gameId}`), {
              ...gameData,
              status: newStatus,
              updatedAt: new Date().toISOString()
          }, { merge: true });
          
          setGames(prev => {
              const newState = { ...prev };
              newState[activeTab] = newState[activeTab].filter(g => g.id !== gameId);
              newState[newStatus].push({ ...gameData, status: newStatus });
              return newState;
          });
          addToast(`Moved to ${SHELF_TABS.find(t=>t.id===newStatus).label}`, "success");
      } catch (err) {
          console.error("Status update err:", err);
      }
  };

  const getFilteredAndSorted = () => {
      let list = [...games[activeTab]];
      
      // Implement filtering if verdict field exists in gameShelf data later
      if (filterVerdict !== 'all') {
          list = list.filter(g => g.verdict === filterVerdict);
      }
      
      list.sort((a,b) => {
          if (sortBy === 'addedAt') return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
          if (sortBy === 'gameName') return a.gameName.localeCompare(b.gameName);
          return 0;
      });
      
      return list;
  };

  const currentList = getFilteredAndSorted();
  const isOwnShelf = user?.uid === targetUid;

  return (
    <div className={`text-white ${!embedded ? 'min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4 md:px-8 max-w-[1400px] mx-auto' : ''}`}>
      {!embedded && <SEO title="My Game Shelf" description="Track every game you've played, abandoned, or plan to start." />}
      
      {!embedded && (
        <div className="mb-12">
            <h1 className="font-syne text-[40px] md:text-[48px] font-black leading-none mb-3">My Game Shelf</h1>
            <p className="text-[var(--text-muted)] text-[16px]">Your entire gaming life in one place.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-[#1e1e1e] mb-6">
          {SHELF_TABS.map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 font-bold text-[14px] whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id 
                          ? 'border-[var(--accent)] text-white' 
                          : 'border-transparent text-[var(--text-muted)] hover:text-white hover:border-[#333]'
                  }`}
              >
                  <span style={{color: tab.color}} className="opacity-80">{tab.icon}</span>
                  {tab.label}
                  <span className="bg-[#222] text-[11px] px-2 py-0.5 rounded-full ml-1">
                      {games[tab.id].length}
                  </span>
              </button>
          ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="text-[13px] text-[var(--text-muted)] font-medium">
             Showing {currentList.length} games
          </div>
          <div className="flex items-center gap-3">
              <select 
                 value={sortBy} 
                 onChange={e => setSortBy(e.target.value)}
                 className="bg-[#111] border border-[#2a2a2a] text-[13px] rounded-lg px-3 h-9 focus:outline-none focus:border-[var(--accent)]"
              >
                  <option value="addedAt">Date Added</option>
                  <option value="gameName">Alphabetical</option>
              </select>
              
              <div className="flex bg-[#111] border border-[#2a2a2a] rounded-lg p-0.5">
                   <button 
                      onClick={() => setViewMode('grid')}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-[#666] hover:text-white'}`}
                   >
                      <FiGrid size={14} aria-hidden="true" />
                   </button>
                   <button 
                      onClick={() => setViewMode('list')}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-[#666] hover:text-white'}`}
                   >
                      <FiList size={14} aria-hidden="true" />
                   </button>
              </div>
          </div>
      </div>

      {/* Content */}
      {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
              {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-[#111] border border-[#222] rounded-xl"></div>)}
          </div>
      ) : currentList.length > 0 ? (
          viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {currentList.map(game => (
                      <Link key={game.id} to={`/game/${game.gameId}`} className="group relative">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#222] group-hover:border-[var(--accent)] transition-all">
                              <img src={game.coverImage} alt={game.gameName} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                  <div className="font-bold text-[14px] text-white leading-tight drop-shadow-md">{game.gameName}</div>
                                                                    {isOwnShelf && (
                                      <button 
                                         onClick={(e) => handleRemove(game.id, e)}
                                         className="absolute top-2 right-2 w-8 h-8 bg-[#ff4757]/80 text-white rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-[#ff4757] transition-all scale-75 hover:scale-100"
                                      >
                                          <FiX size={12} aria-hidden="true" />
                                      </button>
                                   )}
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
          ) : (
              <div className="flex flex-col gap-3">
                  {currentList.map(game => (
                      <Link key={game.id} to={`/game/${game.gameId}`} className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl p-3 hover:border-[var(--accent)] transition-all group">
                          <img src={game.coverImage} alt={game.gameName} className="w-12 h-16 rounded object-cover shadow-sm bg-[#222]" />
                          <div className="flex-1 min-w-0">
                              <div className="font-bold text-[16px] text-white truncate group-hover:text-[var(--accent)] transition-colors">{game.gameName}</div>
                              <div className="text-[12px] text-[#666] mt-0.5">Added {new Date(game.addedAt || game.updatedAt).toLocaleDateString()}</div>
                          </div>
                           {isOwnShelf && (
                               <button 
                                  onClick={(e) => handleRemove(game.id, e)}
                                  className="w-10 h-10 flex items-center justify-center text-[#ff4757] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ff4757]/10 rounded-full mr-2"
                               >
                                   <FiX size={16} aria-hidden="true" />
                               </button>
                           )}
                      </Link>
                  ))}
              </div>
          )
      ) : (
          <EmptyState 
             icon={SHELF_TABS.find(t=>t.id===activeTab).icon}
             title="Your shelf is empty" 
             subtitle={`You haven't added any games to your "${SHELF_TABS.find(t=>t.id===activeTab).label}" list yet.`} 
             ctaText={<>Discover Games <FiArrowRight size={16} aria-hidden="true" /></>} 
             ctaLink="/explore" 
          />
      )}
    </div>
  );
}
