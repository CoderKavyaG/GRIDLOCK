export const mockGames = {
  topRated: [
    {
      id: 1,
      name: "The Legend of Zelda: Breath of the Wild",
      background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
      rating: 9.5,
      released: "2017-03-03",
      platforms: ["Nintendo Switch"],
      genres: ["Action", "Adventure"]
    },
    {
      id: 2,
      name: "Elden Ring",
      background_image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200",
      rating: 9.4,

      released: "2022-02-25",
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      genres: ["Action", "RPG"]
    },
    {
      id: 3,
      name: "Baldur's Gate 3",
      background_image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200",
      rating: 9.3,
      released: "2023-08-03",
      platforms: ["PC", "PlayStation 5"],
      genres: ["RPG", "Adventure"]
    },
    {
      id: 4,
      name: "Cyberpunk 2077",
      background_image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?auto=format&fit=crop&q=80&w=1200",
      rating: 7.8,
      released: "2020-12-10",
      platforms: ["PC", "PlayStation 5", "Xbox Series X"],
      genres: ["Action", "RPG"]
    },
    {
      id: 5,
      name: "Starfield",
      background_image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=1200",
      rating: 8.2,
      released: "2023-09-06",
      platforms: ["PC", "Xbox Series X"],
      genres: ["Action", "RPG", "Adventure"]
    }
  ],
  moodGames: {
    "Story": { id: 101, name: "The Witcher 3", background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", rating: 9.0 },
    "Relaxing": { id: 102, name: "Stardew Valley", background_image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", rating: 8.8 },
    "Action": { id: 103, name: "God of War", background_image: "https://images.unsplash.com/photo-1552824236-07764a8391d2?auto=format&fit=crop&q=80&w=800", rating: 9.1 },
    "Brain Teasers": { id: 104, name: "Portal 2", background_image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=800", rating: 9.0 },
    "Scary": { id: 105, name: "Resident Evil 4", background_image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800", rating: 8.7 },
    "Chill": { id: 106, name: "Journey", background_image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?auto=format&fit=crop&q=80&w=800", rating: 8.9 },
    "Emotional": { id: 107, name: "Life is Strange", background_image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?auto=format&fit=crop&q=80&w=800", rating: 8.2 },
    "Competitive": { id: 108, name: "Counter-Strike 2", background_image: "https://images.unsplash.com/photo-1552824236-07764a8391d2?auto=format&fit=crop&q=80&w=800", rating: 8.5 }
  }
};


// Helper to get mock data with fallback
export const getMockDataFallback = (type = 'topRated') => {
  return mockGames[type] || [];
};
