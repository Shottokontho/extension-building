
export const generateRandomUsername = (): string => {
  const adjectives = ['Swift', 'Clever', 'Bright', 'Silent', 'Mystic', 'Brave', 'Golden', 'Arctic'];
  const nouns = ['Panda', 'Eagle', 'Wolf', 'Ranger', 'Knight', 'Voyager', 'Phoenix', 'Ghost'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}_${noun}_${num}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
