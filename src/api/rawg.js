const BASE = "https://api.rawg.io/api";
const KEY = import.meta.env.VITE_RAWG_KEY;

export const rawg = {
    heroGames: () => `${BASE}/games?ordering=-rating&metacritic=90,100&page_size=5&key=${KEY}`,
    trending: () => `${BASE}/games?ordering=-added&page_size=12&key=${KEY}`,
    topRated: () => `${BASE}/games?ordering=-rating&metacritic=90,100&page_size=12&key=${KEY}`,
    newReleases: () => `${BASE}/games?ordering=-released&page_size=10&key=${KEY}`,
    byGenre: (slug) => `${BASE}/games?genres=${slug}&ordering=-rating&page_size=1&key=${KEY}`,
};
