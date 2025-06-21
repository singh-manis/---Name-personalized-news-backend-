import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HeartIcon, ChatBubbleOvalLeftEllipsisIcon, FireIcon } from '@heroicons/react/24/outline';
import './HomeModern.css';

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/recommendations`, {
          headers: { 'x-auth-token': token },
        });
        setRecs(res.data);
      } catch (err) {
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="modern-bg min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-primary-700 flex items-center mb-8 tracking-tight drop-shadow">
          <FireIcon className="h-8 w-8 mr-2 text-orange-500" /> Recommended for You
        </h1>
        {recs.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No recommendations yet. Read and like more articles to get personalized suggestions!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recs.map((article) => (
              <Link
                to={`/article/${article._id}`}
                key={article._id}
                className="group bg-white rounded-2xl shadow-2xl transition-shadow duration-200 border-l-4 border-primary-400 flex flex-col p-0 focus:outline-none hover:shadow-xl"
                style={{ textDecoration: 'none' }}
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-40 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-200"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{article.summary}</p>
                  )}
                  {article.source?.name && (
                    <span className="text-xs text-gray-500 mb-2">By {article.source.name}</span>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
                    <span className="flex items-center gap-1"><HeartIcon className="h-4 w-4" /> {article.likes ? article.likes.length : 0}</span>
                    <span className="flex items-center gap-1"><ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" /> {article.comments ? article.comments.length : 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 