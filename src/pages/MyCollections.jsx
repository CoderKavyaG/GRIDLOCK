import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import { FaLock, FaGlobeAmericas, FaGamepad } from "react-icons/fa";

export default function MyCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCollections = async () => {
      setLoading(true);
      try {
        const collRef = collection(db, "collections");
        const q = query(collRef, where("uid", "==", user.uid), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const list = [];
        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });
        
        setCollections(list);
      } catch (err) {
         console.error("Error fetching collections:", err);
      } finally {
         setLoading(false);
      }
    };

    fetchCollections();
  }, [user]);

  const renderCoverMosaic = (games) => {
      const gList = games || [];
      if (gList.length === 0) {
          return (
              <div className="w-full h-[140px] bg-[#222] flex items-center justify-center text-[#444] text-[32px]">
                  <FaGamepad />
              </div>
          );
      }
      
      if (gList.length < 4) {
          return (
              <div className="w-full h-[140px] bg-[#1a1a1a] relative">
                  <img src={gList[0].cover} alt="Cover" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent"></div>
              </div>
          );
      }
      
      // 4 or more
      return (
          <div className="grid grid-cols-2 grid-rows-2 h-[140px] w-full">
              {gList.slice(0,4).map((g, i) => (
                  <img key={i} src={g.cover} alt="Cover" className="w-full h-full object-cover" />
              ))}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                     <h1 className="font-syne text-[40px] md:text-[48px] font-black leading-none mb-2">My Collections</h1>
                     <p className="text-[var(--text-muted)] text-[16px]">Curated lists. Ranked favorites. Thematic deep dives.</p>
                </div>
                <Link 
                   to="/collections/new" 
                   className="h-12 px-6 bg-[var(--accent)] text-black font-syne font-bold rounded-lg hover:brightness-105 transition-all text-[14px] flex items-center justify-center"
                >
                    New Collection +
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-[#111] border border-[#222] rounded-[16px]"></div>)}
                </div>
            ) : collections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {collections.map(c => (
                        <div key={c.id} className="bg-[#161616] border border-[#222] rounded-[16px] overflow-hidden group hover:border-[#444] transition-colors relative flex flex-col h-full">
                             
                             <Link to={`/collections/${c.id}`} className="absolute inset-0 z-10"></Link>
                             
                             {/* Cover Mosaic */}
                             <div className="relative border-b border-[#222]">
                                 {renderCoverMosaic(c.games)}
                                 <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wider shadow-lg border border-white/10">
                                      {c.isPublic ? <><FaGlobeAmericas /> Public</> : <><FaLock className="text-[#888]" /> <span className="text-[#888]">Private</span></>}
                                 </div>
                             </div>
                             
                             {/* Body */}
                             <div className="p-5 flex-1 flex flex-col pt-4">
                                  <h3 className="font-syne text-[20px] font-bold text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">{c.title}</h3>
                                  <p className="text-[13px] text-[var(--text-muted)] line-clamp-2 mt-1.5 mb-4 leading-relaxed">
                                      {c.description || <span className="italic opacity-50">No description provided.</span>}
                                  </p>
                                  
                                  <div className="mt-auto pt-4 border-t border-[#222] flex items-center justify-between">
                                      <div className="text-[12px] font-bold text-[#888]">
                                          {(c.games || []).length} GAME{(c.games?.length !== 1) ? 'S' : ''}
                                      </div>
                                      <div className="text-[12px] text-[#555]">
                                          {new Date(c.createdAt).toLocaleDateString()}
                                      </div>
                                  </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <EmptyState 
                    icon="📚"
                    title="No collections yet."
                    subtitle="Bundle your favourite RPGs, ranking lists, or just your backlog into sharable collections."
                    ctaText="Create First Collection →"
                    ctaLink="/collections/new"
                 />
            )}
            
        </div>
    </div>
  );
}
