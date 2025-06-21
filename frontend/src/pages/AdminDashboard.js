import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './HomeModern.css';

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/all`, {
        headers: { 'x-auth-token': token },
      });
      setArticles(res.data || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch articles');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/news/article/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setArticles((prev) => prev.filter((a) => a._id !== id));
      toast.success('Article deleted');
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className="modern-bg min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-primary-700 mb-8 tracking-tight drop-shadow">Admin Dashboard</h1>
          <div className="mb-6 flex gap-3">
            <Link to="/admin/new" className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-primary-700 transition">Add New Article</Link>
            <button
              onClick={fetchArticles}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold border border-gray-300 shadow hover:bg-gray-300 transition"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-primary-700 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-primary-700 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-primary-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id} className="hover:bg-primary-50 transition">
                      <td className="px-4 py-2 font-medium text-gray-900">{article.title}</td>
                      <td className="px-4 py-2 text-gray-700">{article.category}</td>
                      <td className="px-4 py-2">
                        <Link to={`/admin/edit/${article._id}`} className="text-blue-600 hover:underline mr-4 font-semibold">Edit</Link>
                        <button onClick={() => handleDelete(article._id)} className="text-red-600 hover:underline font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 