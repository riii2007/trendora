// simple outline icons used in the navbar and product cards
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const HeartIcon = ({ filled }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3 5 6.3 5c2 0 3.5 1.1 4.2 2.4h3C14.2 6.1 15.700 5 17.700 5 21 5 23 8.400 21.600 11.700 19.500 16.400 12 21 12 21z" />
  </svg>
);

export const BagIcon = () => (
  <svg {...base}>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const UserIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.600-7 8-7s8 3 8 7" />
  </svg>
);

export const SearchIcon = () => (
  <svg {...base} width="18" height="18">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.300-4.300" />
  </svg>
);
