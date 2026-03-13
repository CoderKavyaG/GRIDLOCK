import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import { BiJoystick } from "react-icons/bi";
import { rawg } from "../api/rawg";
import GameCard from "../components/GameCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import SEO from "../components/SEO";

// RAWG map ids
const GENRES_MAP = {
  Action: 4, RPG: 5, Strategy: 10, Shooter: 2, Adventure: 3, 
  Puzzle: 7, Racing: 1, Sports: 15, Fighting: 6, Indie: 51, Horror: 59 // using platform/genre ids roughly, maybe need exact slugs if genre string
};
// Platforms: PC: 4, PlayStation: 187,18,16 (PS5, PS4, PS3), Xbox: 1,14, Nintendo: 7
const PLATFORMS_MAP = {
  PC: 4, PlayStation: "187,18", Xbox: "1,14", Nintendo: "7", Mobile: "21,43"
};
const SORTS_MAP = {
  "Popular": "-added",
  "Top Rated": "-rating",
  "New Releases": "-released",
  "Alphabetical": "name"
};
const YEARS_MAP = {
  "2025": "2025-01-01,2025-12-31",
  "2024": "2024-01-01,2024-12-31",
  "2023": "2023-01-01,2023-12-31",
  "2020s": "2020-01-01,2029-12-31",
  "2010s": "2010-01-01,2019-12-31",
  "Classic": "1980-01-01,2009-12-31"
};

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Active Filters
  const [activeFilters, setActiveFilters] = useState({
    genre: searchParams.get("genre") || "",
    platform: searchParams.get("platform") || "",
    year: searchParams.get("year") || "",
    sort: searchParams.get("sort") || "Popular"
  });

  // Sync state with URL params (handles mid-mount navigation like Navbar search)
  useEffect(() => {
    const s = searchParams.get("search") || "";
    const g = searchParams.get("genre") || "";
    const p = searchParams.get("platform") || "";
    const y = searchParams.get("year") || "";
    const o = searchParams.get("sort") || "Popular";

    setQuery(s);
    setActiveFilters({ genre: g, platform: p, year: y, sort: o });
  }, [searchParams]);


  const fetchGames = useCallback(async (isLoadMore = false) => {
    isLoadMore ? setLoadingMore(true) : setLoading(true);
    
    try {
      const p = isLoadMore ? page + 1 : 1;
      const apiParams = { page: p };
      if (query.trim()) apiParams.search = query;
      if (activeFilters.genre) apiParams.genres = activeFilters.genre.toLowerCase(); // slug mapping
      if (activeFilters.platform && PLATFORMS_MAP[activeFilters.platform]) apiParams.platforms = PLATFORMS_MAP[activeFilters.platform];
      if (activeFilters.year && YEARS_MAP[activeFilters.year]) apiParams.dates = YEARS_MAP[activeFilters.year];
      if (activeFilters.sort && SORTS_MAP[activeFilters.sort]) apiParams.ordering = SORTS_MAP[activeFilters.sort];
      
      const res = await fetch(rawg.explore(apiParams));
      const data = await res.json();
      
      if (isLoadMore) {
        setGames(prev => [...prev, ...data.results]);
        setPage(p);
      } else {
        setGames(data.results || []);
        setPage(1);
        setTotalCount(data.count || 0);
      }
      
      setHasNextPage(!!data.next);
      
      // Update URL silently
      const newParams = new URLSearchParams();
      if (query.trim()) newParams.set("search", query);
      if (activeFilters.genre) newParams.set("genre", activeFilters.genre);
      if (activeFilters.platform) newParams.set("platform", activeFilters.platform);
      if (activeFilters.year) newParams.set("year", activeFilters.year);
      if (activeFilters.sort !== "Popular") newParams.set("sort", activeFilters.sort);
      setSearchParams(newParams, { replace: true });

    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      isLoadMore ? setLoadingMore(false) : setLoading(false);
    }
  }, [query, activeFilters, page, setSearchParams]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGames(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, activeFilters]); // Ignore fetchGames dependency deliberately here

  const handleFilterClick = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? "" : value // toggle off if same
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ genre: "", platform: "", year: "", sort: "Popular" });
    setQuery("");
  };

  const hasActiveFilters = query.trim() || activeFilters.genre || activeFilters.platform || activeFilters.year || activeFilters.sort !== "Popular";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
      <SEO title="Explore Games" description="Discover over 500,000 games with advanced filters and community verdicts." />
      {/* HEADER & SEARCH */}
      <div className="w-full bg-[#111] py-12 px-4 md:px-8 border-b border-[#1e1e1e]">
         <div className="max-w-[1400px] mx-auto">
             <h1 className="font-syne text-[40px] md:text-[48px] font-black mb-8 leading-none">Explore Games</h1>
             
             <div className="relative max-w-2xl">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} aria-hidden="true" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search over 500,000 games..."
                  className="w-full h-14 bg-[#161616] border border-[#2a2a2a] rounded-xl pl-12 pr-12 text-[16px] text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[#555]"
                />
                {query && (
                  <button 
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white bg-[#222] p-1.5 rounded-md transition-colors"
                  >
                    <FiX size={12} aria-hidden="true" />
                  </button>
                )}
             </div>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
         {/* FILTER BAR */}
         <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                <div className="flex gap-2 min-w-max border-r border-[#2a2a2a] pr-4">
                  <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center mr-2">Sort</span>
                  {Object.keys(SORTS_MAP).map(sort => (
                    <button 
                      key={sort}
                      onClick={() => handleFilterClick("sort", sort)}
                      className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                        activeFilters.sort === sort ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' : 'bg-[#161616] border-[#2a2a2a] text-[var(--text-muted)] hover:border-[#444]'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 min-w-max border-r border-[#2a2a2a] pr-4 pl-2">
                   <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center mr-2">Genre</span>
                   {Object.keys(GENRES_MAP).map(genre => (
                    <button 
                      key={genre}
                      onClick={() => handleFilterClick("genre", genre)}
                      className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                        activeFilters.genre === genre ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' : 'bg-[#161616] border-[#2a2a2a] text-[var(--text-muted)] hover:border-[#444]'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 min-w-max border-r border-[#2a2a2a] pr-4 pl-2">
                   <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center mr-2">Platform</span>
                   {Object.keys(PLATFORMS_MAP).map(platform => (
                    <button 
                      key={platform}
                      onClick={() => handleFilterClick("platform", platform)}
                      className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                        activeFilters.platform === platform ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' : 'bg-[#161616] border-[#2a2a2a] text-[var(--text-muted)] hover:border-[#444]'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 min-w-max pl-2">
                   <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center mr-2">Year</span>
                   {Object.keys(YEARS_MAP).map(year => (
                    <button 
                      key={year}
                      onClick={() => handleFilterClick("year", year)}
                      className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                        activeFilters.year === year ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' : 'bg-[#161616] border-[#2a2a2a] text-[var(--text-muted)] hover:border-[#444]'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
            </div>

            {hasActiveFilters && (
               <div className="flex items-center gap-4 text-[13px]">
                   <span className="text-[var(--text-muted)]">
                     Showing {totalCount.toLocaleString()} results
                   </span>
                   {hasActiveFilters && (
                     <button onClick={clearAllFilters} className="text-[var(--accent)] hover:underline">
                        Clear all filters
                     </button>
                   )}
               </div>
            )}
         </div>

         {/* RESULTS GRID */}
         {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {Array.from({length: 18}).map((_, i) => <SkeletonCard key={i} />)}
             </div>
         ) : games.length > 0 ? (
             <>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {games.map(game => (
                   <GameCard key={game.id} game={game} />
                 ))}
               </div>

               {hasNextPage && (
                  <div className="flex flex-col items-center mt-16 mb-8">
                     <p className="text-[var(--text-muted)] text-[13px] mb-4">Showing {games.length} of {totalCount.toLocaleString()} results</p>
                     <button 
                        onClick={() => fetchGames(true)}
                        disabled={loadingMore}
                        className="px-8 py-3 bg-[#161616] border border-[#2a2a2a] hover:border-[var(--accent)] rounded-[10px] font-syne font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                     >
                        {loadingMore ? (
                           <>
                             <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-white rounded-full animate-spin"></div>
                             Loading...
                           </>
                        ) : "Load More Games"}
                     </button>
                  </div>
               )}
             </>
         ) : (
             <EmptyState 
                icon={<BiJoystick size={48} />}
                title="No results found"
                subtitle="Try adjusting your search or filters to broaden your search."
                ctaText={<>Clear All Filters <FiX size={16} aria-hidden="true" /></>}
                onCtaClick={clearAllFilters}
             />
         )}

      </div>
    </div>
  );
}
