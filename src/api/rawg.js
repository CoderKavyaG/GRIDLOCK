const BASE = "https://api.rawg.io/api";
const KEY = import.meta.env.VITE_RAWG_KEY;

if (!KEY) {
    console.warn("⚠️ RAWG API Key is missing! Check your Vercel Environment Variables.");
}

export const rawg = {
    heroGames: () => `${BASE}/games?ordering=-rating&metacritic=90,100&page_size=5&key=${KEY}`,
    trending: () => `${BASE}/games?ordering=-added&page_size=12&key=${KEY}`,
    topRated: () => `${BASE}/games?ordering=-rating&metacritic=90,100&page_size=12&key=${KEY}`,
    newReleases: () => `${BASE}/games?ordering=-released&page_size=10&key=${KEY}`,
    byGenre: (slug) => `${BASE}/games?genres=${slug}&ordering=-rating&page_size=12&key=${KEY}`,
    gameDetails: (id) => `${BASE}/games/${id}?key=${KEY}`,
    gameScreenshots: (id) => `${BASE}/games/${id}/screenshots?key=${KEY}`,
    gameMovies: (id) => `${BASE}/games/${id}/movies?key=${KEY}`,
    searchGames: (query, page = 1) => `${BASE}/games?search=${query}&page=${page}&page_size=20&key=${KEY}`,
    search: (query, limit = 6) => `${BASE}/games?search=${query}&page_size=${limit}&key=${KEY}`,
    explore: (params) => {
        let url = `${BASE}/games?key=${KEY}&page_size=20`;
        if (params.page) url += `&page=${params.page}`;
        if (params.search) url += `&search=${params.search}`;
        if (params.ordering) url += `&ordering=${params.ordering}`;
        if (params.dates) url += `&dates=${params.dates}`;
        if (params.genres) url += `&genres=${params.genres}`;
        if (params.platforms) url += `&platforms=${params.platforms}`;
        return url;
    },
    topGames: () => `${BASE}/games?ordering=-rating,-added&page_size=50&key=${KEY}`
};
