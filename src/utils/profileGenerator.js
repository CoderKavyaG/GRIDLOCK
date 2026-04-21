// Generate random username and avatar
export const generateRandomUsername = () => {
  const adjectives = ['Cosmic', 'Stellar', 'Quantum', 'Neural', 'Pixel', 'Cyber', 'Mystic', 'Sonic', 'Phoenix', 'Vortex', 'Shadow', 'Blaze'];
  const nouns = ['Gamer', 'Player', 'Knight', 'Warrior', 'Sage', 'Hunter', 'Ranger', 'Mage', 'Rogue', 'Titan', 'Reaper', 'Legend'];
  const number = Math.floor(Math.random() * 9000) + 1000;
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}${noun}${number}`;
};

// Generate random avatar using DiceBear API (deterministic based on seed)
export const generateRandomAvatar = (username) => {
  const avatarStyles = ['adventurer', 'avataaars', 'pixel-art', 'big-ears'];
  const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}&scale=80`;
};

// Generate both together
export const generateRandomProfile = () => {
  const username = generateRandomUsername();
  const avatar = generateRandomAvatar(username);
  return { username, avatar };
};
