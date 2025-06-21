import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './HomeModern.css';

export default function Bookmarks() {
  const [articles, setArticles] = useState([]);
  const [externalBookmarks, setExternalBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/saved`, {
        headers: { 'x-auth-token': token },
      });
      setArticles(res.data || []);
      const profile = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        headers: { 'x-auth-token': token },
      });
      setExternalBookmarks(profile.data.externalBookmarks || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch bookmarks');
      setLoading(false);
    }
  };

  const handleUnbookmark = async (article) => {
    try {
      const token = localStorage.getItem('token');
      if (article._id) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/news/article/${article._id}/save`, {
          headers: { 'x-auth-token': token },
        });
        setArticles((prev) => prev.filter((a) => a._id !== article._id));
      } else {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/news/external/bookmark`, {
          data: { url: article.url },
          headers: { 'x-auth-token': token },
        });
        setExternalBookmarks((prev) => prev.filter((url) => url !== article.url));
      }
      toast.success('Article removed from bookmarks');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="modern-bg min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-primary-700 mb-8 tracking-tight drop-shadow">Bookmarked Articles</h1>
          {articles.length === 0 && externalBookmarks.length === 0 ? (
            <p className="text-gray-500">No bookmarks yet.</p>
          ) : (
            <>
              {articles.length > 0 && (
                <ul className="divide-y divide-gray-200 mb-8">
                  {articles.map((article) => (
                    <li key={article._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Link to={`/article/${article._id}`} className="text-primary-600 hover:underline font-medium">
                          {article.title}
                        </Link>
                        <span className="ml-2 text-gray-500 text-sm">{article.category}</span>
                        <button
                          onClick={() => handleUnbookmark(article)}
                          className="ml-4 text-xs text-red-600 hover:underline font-semibold"
                        >
                          Unbookmark
                        </button>
                      </div>
                      {article.summary && (
                        <span className="text-xs text-gray-400 max-w-xs truncate">{article.summary}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {externalBookmarks.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {externalBookmarks.map((url) => (
                    <li key={url} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Link to="/external-article" state={{ article: { url } }} className="text-primary-600 hover:underline font-medium">
                          {url}
                        </Link>
                        <button
                          onClick={() => handleUnbookmark({ url })}
                          className="ml-4 text-xs text-red-600 hover:underline font-semibold"
                        >
                          Unbookmark
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 