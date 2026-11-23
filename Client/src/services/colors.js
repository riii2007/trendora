// colour names -> hex codes for the little colour dots in the filters
const COLORS = {
  black: '#111111', white: '#ffffff', grey: '#9e9e9e', gray: '#9e9e9e', navy: '#1f2a56', red: '#d32f2f',
  blue: '#1976d2', 'light blue': '#90caf9', 'dark blue': '#0d2a5c', green: '#2e7d32', olive: '#708238',
  yellow: '#fbc02d', mustard: '#d4a017', orange: '#ef6c00', pink: '#f48fb1', maroon: '#800000',
  brown: '#6d4c41', beige: '#d9c7a3', tan: '#c19a6b', silver: '#c0c0c0', gold: '#d4af37',
  purple: '#7b1fa2', teal: '#00897b', nude: '#e0b9a0',
};

export const colorHex = (name) => COLORS[name.toLowerCase()] || '#cccccc';
