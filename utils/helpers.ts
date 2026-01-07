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

export const getChartData = (period: 'week' | 'month' | 'year', requests: any[]) => {
  const approved = requests.filter(r => r.status === 'APPROVED');
  const labels: string[] = [];
  const values: number[] = [];

  const now = new Date();
  
  if (period === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(label);
      const total = approved.filter(r => new Date(r.timestamp).toDateString() === d.toDateString())
        .reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * 120 : curr.amount), 0);
      values.push(total);
    }
  } else if (period === 'month') {
    for (let i = 29; i >= 0; i -= 5) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(label);
      const total = approved.filter(r => {
        const rd = new Date(r.timestamp);
        return rd > new Date(d.getTime() - 2 * 24 * 60 * 60 * 1000) && rd <= d;
      }).reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * 120 : curr.amount), 0);
      values.push(total);
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      labels.push(label);
      const total = approved.filter(r => new Date(r.timestamp).getMonth() === d.getMonth())
        .reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * 120 : curr.amount), 0);
      values.push(total);
    }
  }

  return { labels, values };
};