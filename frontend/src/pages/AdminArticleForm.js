import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const categories = [
  'technology', 'science', 'business', 'health', 'entertainment', 'sports', 'politics', 'education'
];

export default function AdminArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    imageUrl: '',
    videoUrl: '',
    podcastUrl: '',
    tags: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchArticle();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/article/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setForm({
        title: res.data.title || '',
        content: res.data.content || '',
        summary: res.data.summary || '',
        category: res.data.category || '',
        imageUrl: res.data.imageUrl || '',
        videoUrl: res.data.videoUrl || '',
        podcastUrl: res.data.podcastUrl || '',
        tags: (res.data.tags || []).join(', '),
      });
      setNotFound(false);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Failed to fetch article');
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/news/article/${id}`, payload, {
          headers: { 'x-auth-token': token },
        });
        toast.success('Article updated');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/news/article`, payload, {
          headers: { 'x-auth-token': token },
        });
        toast.success('Article created');
      }
      navigate('/admin');
    } catch (err) {
      toast.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Article Not Found</h1>
        <button onClick={() => navigate('/admin')} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Back to Admin</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Article' : 'Add New Article'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea name="summary" value={form.summary} onChange={handleChange} required rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
            <option value="">Select category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Video URL</label>
          <input type="text" name="videoUrl" value={form.videoUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Podcast URL</label>
          <input type="text" name="podcastUrl" value={form.podcastUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input type="text" name="tags" value={form.tags} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            {loading ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
} 