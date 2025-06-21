import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './HomeModern.css';

export default function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [externalHistory, setExternalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        headers: { 'x-auth-token': token },
      });
      setHistory(res.data.readingHistory || []);
      const ext = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/external-history`, {
        headers: { 'x-auth-token': token },
      });
      setExternalHistory(ext.data || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch reading history');
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/history/${articleId}`, {
        headers: { 'x-auth-token': token },
      });
      setHistory((prev) => prev.filter((entry) => (entry.articleId._id || entry.articleId) !== articleId));
      toast.success('History entry removed');
    } catch (err) {
      toast.error('Failed to remove history entry');
    }
  };

  const handleDeleteExternalHistory = async (url) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/external-history`, {
        data: { url },
        headers: { 'x-auth-token': token },
      });
      setExternalHistory((prev) => prev.filter((entry) => entry.url !== url));
      toast.success('History entry removed');
    } catch (err) {
      toast.error('Failed to remove history entry');
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
          <h1 className="text-3xl font-extrabold text-primary-700 mb-8 tracking-tight drop-shadow">Reading History</h1>
          {history.length === 0 && externalHistory.length === 0 ? (
            <p className="text-gray-500">No reading history yet.</p>
          ) : (
            <>
              {history.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">Local Articles</h2>
                  <ul className="divide-y divide-gray-200 mb-8">
                    {history.slice().reverse().map((entry, idx) => (
                      <li key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Link to={`/article/${entry.articleId}`} className="text-primary-600 hover:underline font-medium">
                            {entry.articleId?.title || entry.articleId}
                          </Link>
                          <span className="ml-2 text-gray-500 text-sm">{entry.readAt ? new Date(entry.readAt).toLocaleString() : ''}</span>
                          <button
                            onClick={() => handleDeleteHistory(entry.articleId._id || entry.articleId)}
                            className="ml-4 text-xs text-red-600 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                        {entry.timeSpent && (
                          <span className="text-xs text-gray-400">{entry.timeSpent} min</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {externalHistory.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">NewsAPI Articles</h2>
                  <ul className="divide-y divide-gray-200">
                    {externalHistory.slice().reverse().map((entry, idx) => (
                      <li key={entry.url} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          {entry.imageUrl && <img src={entry.imageUrl} alt="thumb" className="h-10 w-16 object-cover rounded" />}
                          <Link to="/external-article" state={{ article: { url: entry.url, title: entry.title, urlToImage: entry.imageUrl, source: { name: entry.source } } }} className="text-primary-600 hover:underline font-medium">
                            {entry.title}
                          </Link>
                          <span className="ml-2 text-gray-500 text-sm">{entry.readAt ? new Date(entry.readAt).toLocaleString() : ''}</span>
                          <button
                            onClick={() => handleDeleteExternalHistory(entry.url)}
                            className="ml-4 text-xs text-red-600 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 