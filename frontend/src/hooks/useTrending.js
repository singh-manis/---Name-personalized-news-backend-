import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useTrending() {
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const fetchTrending = useCallback(async () => {
    try {
      setLoadingTrending(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/trending`, {
        headers: { 'x-auth-token': token },
      });
      setTrending(res.data);
    } catch (err) {
      toast.error('Failed to fetch trending articles');
    } finally {
      setLoadingTrending(false);
    }
  }, []);

  return {
    trending,
    loadingTrending,
    fetchTrending,
    setTrending,
  };
} 