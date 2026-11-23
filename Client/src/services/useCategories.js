import { useEffect, useState } from 'react';
import api from '../api';

// loads categories (with subcategories) from the backend once and shares them
let cache = null;

export default function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    if (cache) return;
    api.get('/categories').then((r) => { cache = r.data; setCategories(r.data); }).catch(console.log);
  }, []);

  return categories;
}
