import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import EmptyState from "../components/EmptyState";
import { FaFire, FaClock, FaThumbsUp, FaThumbsDown } from "react-icons/fa";

export default function Debates() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hot"); // hot | new

  useEffect(() => {
    const fetchDebates = async () => {
      setLoading(true);
      try {
        const dRef = collection(db, "debates");
        const orderField = activeTab === 'hot' ? 'agreeCount' : 'createdAt'; 
        // using agreeCount as proxy for 'hot' for now if hot bool isn't reliable
        const q = query(dRef, orderBy(orderField, "desc")); 
        
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });
        
        // Mock data if empty for demo purposes (usually handled via actual DB seed)
        if (list.length === 0) {
             const mock1 = {
                 id: "demo_1",
                 title: "Is difficulty an accessibility issue?",
                 statement: "Games like Elden Ring should have easy modes for accessibility.",
                 gameId: 58134,
                 gameName: "Elden Ring",
                 gameCover: "https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efdf5ac6f6cf56.jpg",
                 agreeCount: 342,
                 disagreeCount: 1205,
                 createdAt: new Date().toISOString()
             };
             const mock2 = {
                 id: "demo_2",
                 title: "Remakes vs Original Vision",
                 statement: "The Last of Us Part 1 remake was entirely unnecessary.",
                 gameId: 28,
                 gameName: "The Last of Us",
                 gameCover: "https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg",
                 agreeCount: 890,
                 disagreeCount: 885,
                 createdAt: new Date().toISOString()
             };
             setDebates([mock1, mock2]);
        } else {
             setDebates(list);
        }
      } catch (err) {
          console.error("Error fetching debates:", err);
      } finally {
          setLoading(false);
      }
    };
    
    fetchDebates();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
        <div className="w-full bg-[#111] py-12 px-4 md:px-8 border-b border-[#1e1e1e] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)] filter blur-[150px] opacity-[0.05] pointer-events-none"></div>
            
            <div className="max-w-[900px] mx-auto text-center relative z-10">
                 <h1 className="font-syne text-[48px] md:text-[64px] font-black leading-none mb-4 tracking-tight drop-shadow-lg flex items-center justify-center gap-4">
                     Hot Debates <span className="text-[var(--accent)] text-[40px]">🔥</span>
                 </h1>
                 <p className="text-[var(--text-muted)] text-[16px] md:text-[20px] max-w-2xl mx-auto">
                     The internet has opinions. What are yours?
                 </p>
                 
                 <div className="flex justify-center gap-2 mt-8">
                     <button
                         onClick={() => setActiveTab('hot')}
                         className={`h-12 px-8 rounded-full font-bold text-[14px] transition-all flex items-center gap-2 ${activeTab === 'hot' ? 'bg-[var(--accent)] text-black' : 'bg-[#161616] text-[#888] border border-[#2a2a2a] hover:text-white'}`}
                     >
                         <FaFire /> Hot
                     </button>
                     <button
                         onClick={() => setActiveTab('new')}
                         className={`h-12 px-8 rounded-full font-bold text-[14px] transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-[var(--accent)] text-black' : 'bg-[#161616] text-[#888] border border-[#2a2a2a] hover:text-white'}`}
                     >
                         <FaClock /> New
                     </button>
                 </div>
            </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-12">
             {loading ? (
                 <div className="space-y-6 animate-pulse">
                     {[1,2,3].map(i => <div key={i} className="h-32 bg-[#161616] rounded-2xl border border-[#222]"></div>)}
                 </div>
             ) : debates.length > 0 ? (
                 <div className="space-y-6">
                     {debates.map(debate => {
                         const total = (debate.agreeCount || 0) + (debate.disagreeCount || 0);
                         const agreePct = total > 0 ? Math.round((debate.agreeCount / total) * 100) : 50;
                         const disagreePct = 100 - agreePct;
                         
                         return (
                             <div key={debate.id} className="bg-[#161616] border border-[#222] rounded-[16px] p-6 transition-all hover:border-[#444] group">
                                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                      {/* Game Cover */}
                                      <Link to={`/game/${debate.gameId}`} className="w-16 h-20 shrink-0 shadow-lg relative group-hover:scale-105 transition-transform hidden sm:block">
                                          <img src={debate.gameCover} alt={debate.gameName} className="w-full h-full object-cover rounded-md border border-[#333]" />
                                      </Link>
                                      
                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                           <div className="inline-block px-3 py-1 bg-[#111] text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider rounded-md border border-[#2a2a2a] mb-3">
                                               {debate.gameName}
                                           </div>
                                           <h2 className="font-syne text-[20px] md:text-[24px] font-bold text-white mb-2 leading-tight">
                                               "{debate.statement}"
                                           </h2>
                                           
                                           <div className="flex items-center gap-3 text-[12px] text-[#666] font-medium mt-4">
                                               <span className="flex items-center gap-1.5"><FaThumbsUp className="text-[#2ed573]"/> {debate.agreeCount || 0}</span>
                                               <span className="flex items-center gap-1.5"><FaThumbsDown className="text-[#ff4757]"/> {debate.disagreeCount || 0}</span>
                                               <span className="ml-auto opacity-50">{new Date(debate.createdAt).toLocaleDateString()}</span>
                                           </div>
                                           
                                           <div className="h-2 w-full flex rounded-full overflow-hidden mt-3 opacity-80">
                                               <div className="bg-[#2ed573]" style={{width: `${agreePct}%`}}></div>
                                               <div className="bg-[#ff4757]" style={{width: `${disagreePct}%`}}></div>
                                           </div>
                                      </div>
                                      
                                      {/* Action */}
                                      <Link 
                                         to={`/debates/${debate.id}`} 
                                         className="w-full md:w-auto mt-4 md:mt-0 px-6 h-12 bg-[#111] border border-[#2a2a2a] rounded-[10px] font-syne font-bold hover:bg-white hover:text-black flex items-center justify-center transition-all shrink-0"
                                      >
                                          Join Debate →
                                      </Link>
                                  </div>
                             </div>
                         );
                     })}
                 </div>
             ) : (
                 <EmptyState icon="🗣️" title="No debates found" subtitle="The community is very quiet right now." />
             )}
        </div>
    </div>
  );
}
