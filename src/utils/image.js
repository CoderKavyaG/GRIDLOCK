export const optimizeImage = (url, size = 640) => {
    if (!url) return "";
    if (!url.includes("media.rawg.io")) return url;
    
    // RAWG format: https://media.rawg.io/media/games/...
    // Target format: https://media.rawg.io/media/resize/640/-/games/...
    
    return url.replace("media.rawg.io/media/", `media.rawg.io/media/resize/${size}/-/`);
};
