import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import './HomeModern.css';

export default function KnowledgeBase() {
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    notes: '',
  });
  const { t } = useTranslation();

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/knowledge-base`, {
        headers: {
          'x-auth-token': token,
        },
      });
      setKnowledgeBase(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch knowledge base');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        // Update existing entry
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/user/knowledge-base/${editingId}`,
          formData,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
        toast.success('Knowledge base entry updated');
      } else {
        // Add new entry
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/user/knowledge-base`,
          formData,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
        toast.success('New entry added to knowledge base');
      }
      setFormData({ topic: '', notes: '' });
      setIsAdding(false);
      setEditingId(null);
      fetchKnowledgeBase();
    } catch (err) {
      toast.error('Failed to save knowledge base entry');
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      topic: entry.topic,
      notes: entry.notes,
    });
    setEditingId(entry._id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/knowledge-base/${id}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        toast.success('Entry deleted successfully');
        fetchKnowledgeBase();
      } catch (err) {
        toast.error('Failed to delete entry');
      }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary-700 tracking-tight drop-shadow">{t('Knowledge Base')}</h1>
          <button
            onClick={() => {
              setIsAdding(true);
              setFormData({ topic: '', notes: '' });
              setEditingId(null);
            }}
            className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('Add Entry')}
          </button>
        </div>
        {isAdding && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-primary-700 mb-4">
              {editingId ? t('Edit Entry') : t('Add New Entry')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  {t('Topic')}
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  {t('Notes')}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({ topic: '', notes: '' });
                  }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 shadow"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 border border-transparent rounded-lg shadow text-base font-semibold text-white bg-primary-600 hover:bg-primary-700"
                >
                  {editingId ? t('Update') : t('Save')}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeBase.map((entry) => (
            <div key={entry._id} className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-primary-700">{entry.topic}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{entry.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 