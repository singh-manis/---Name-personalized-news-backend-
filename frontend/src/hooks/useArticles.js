import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/feed`, {
        headers: { 'x-auth-token': token },
      });
      setArticles(res.data.articles || []);
      setNextPage(res.data.nextPage || null);
    } catch (err) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreArticles = useCallback(async () => {
    if (!nextPage) return;
    setLoadingMore(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/feed?nextPage=${encodeURIComponent(nextPage)}`, {
        headers: { 'x-auth-token': token },
      });
      setArticles(prev => [...prev, ...(res.data.articles || [])]);
      setNextPage(res.data.nextPage || null);
    } catch (err) {
      toast.error('Failed to load more articles');
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage]);

  return {
    articles,
    nextPage,
    loading,
    loadingMore,
    fetchArticles,
    loadMoreArticles,
    setArticles, // expose for real-time updates
    setNextPage,
  };
} 