// Mock game data for development when API is unavailable
export const mockGames = {
  topRated: [
    {
      id: 1,
      name: "The Legend of Zelda: Breath of the Wild",
      background_image: "https://media.rawg.io/media/games/4a0/4a0a2b6e6b6b6b6b6b6b6b6b6b6b6b6b.jpg",
      rating: 9.5,
      released: "2017-03-03",
      platforms: ["Nintendo Switch"],
      genres: ["Action", "Adventure"]
    },
    {
      id: 2,
      name: "Elden Ring",
      background_image: "https://media.rawg.io/media/games/511/5118aff5091cb3efb259841f1217cfad.jpg",
      rating: 9.4,
      released: "2022-02-25",
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      genres: ["Action", "RPG"]
    },
    {
      id: 3,
      name: "Baldur's Gate 3",
      background_image: "https://media.rawg.io/media/games/26d/26d548f34bde0469fb34eab53f36823d.jpg",
      rating: 9.3,
      released: "2023-08-03",
      platforms: ["PC", "PlayStation 5"],
      genres: ["RPG", "Adventure"]
    },
    {
      id: 4,
      name: "Cyberpunk 2077",
      background_image: "https://media.rawg.io/media/games/b7d/b7d40ede872d6de7d9d432dad5fc3328.jpg",
      rating: 7.8,
      released: "2020-12-10",
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      genres: ["Action", "RPG"]
    },
    {
      id: 5,
      name: "Starfield",
      background_image: "https://media.rawg.io/media/games/713/71386d5309cb33e452793490555d61d2.jpg",
      rating: 8.2,
      released: "2023-09-06",
      platforms: ["PC", "Xbox Series X"],
      genres: ["Action", "RPG", "Adventure"]
    }
  ],
  moodGames: {
    "Story": { id: 101, name: "The Witcher 3", background_image: "https://media.rawg.io/media/games/34b/34b1f1850a1cb3ee976e0f20b462ca3b.jpg", rating: 9.0 },
    "Relaxing": { id: 102, name: "Stardew Valley", background_image: "https://media.rawg.io/media/games/46d/46d98e6910fbc58131caf7687ff4dcd5.jpg", rating: 8.8 },
    "Action": { id: 103, name: "God of War", background_image: "https://media.rawg.io/media/games/4be/4be6a6ad0364751a96b643cc3be7dc3b.jpg", rating: 9.1 },
    "Brain Teasers": { id: 104, name: "Portal 2", background_image: "https://media.rawg.io/media/games/7fa/7fa0105d582eea2c35ef99df34848bb0.jpg", rating: 9.0 },
    "Scary": { id: 105, name: "Resident Evil 4", background_image: "https://media.rawg.io/media/games/d82/d82990a3440fdb75669e70ffa9b66b97.jpg", rating: 8.7 },
    "Chill": { id: 106, name: "Journey", background_image: "https://media.rawg.io/media/games/16b/16b1b7b3d6c6c6c6c6c6c6c6c6c6c6c6.jpg", rating: 8.9 },
    "Emotional": { id: 107, name: "Life is Strange", background_image: "https://media.rawg.io/media/games/8cc/8cce7c0e99dcc6d77e2001c4a0819ee9.jpg", rating: 8.2 },
    "Competitive": { id: 108, name: "Counter-Strike 2", background_image: "https://media.rawg.io/media/games/26d/26d548f34bde0469fb34eab53f36823d.jpg", rating: 8.5 }
  }
};

// Helper to get mock data with fallback
export const getMockDataFallback = (type = 'topRated') => {
  return mockGames[type] || [];
};
