const BASE = "https://api.rawg.io/api";
const KEY = import.meta.env.VITE_RAWG_KEY;

if (!KEY) {
    console.warn("RAWG API Key is missing! Check your Vercel Environment Variables.");
}

// Only use top 50 popular games to ensure quality and reduce API calls
const TOP_POPULAR_FILTER = '&ordering=-metacritic,-rating&metacritic=70';

export const rawg = {
    heroGames: () => `${BASE}/games?${TOP_POPULAR_FILTER}&page_size=3&key=${KEY}`,
    trending: () => `${BASE}/games?${TOP_POPULAR_FILTER}&page_size=6&key=${KEY}`,
    topRated: () => `${BASE}/games?${TOP_POPULAR_FILTER}&page_size=6&key=${KEY}`,
    newReleases: () => `${BASE}/games?${TOP_POPULAR_FILTER}&page_size=5&key=${KEY}`,
    byGenre: (slug) => `${BASE}/games?genres=${slug}${TOP_POPULAR_FILTER}&page_size=6&key=${KEY}`,
    gameDetails: (id) => `${BASE}/games/${id}?key=${KEY}`,
    gameScreenshots: (id) => `${BASE}/games/${id}/screenshots?page_size=12&key=${KEY}`,
    gameMovies: (id) => `${BASE}/games/${id}/movies?page_size=5&key=${KEY}`,
    searchGames: (query, page = 1) => `${BASE}/games?search=${query}&page=${page}&page_size=15&key=${KEY}`,
    search: (query, limit = 6) => `${BASE}/games?search=${query}&page_size=${limit}&key=${KEY}`,
    explore: (params) => {
        let url = `${BASE}/games?key=${KEY}&page_size=12${TOP_POPULAR_FILTER}`;
        if (params.page) url += `&page=${params.page}`;
        if (params.search) url += `&search=${params.search}`;
        if (params.ordering) url += `&ordering=${params.ordering}`;
        if (params.dates) url += `&dates=${params.dates}`;
        if (params.genres) url += `&genres=${params.genres}`;
        if (params.platforms) url += `&platforms=${params.platforms}`;
        return url;
    },
    topGames: () => `${BASE}/games?${TOP_POPULAR_FILTER}&page_size=50&key=${KEY}`
};
