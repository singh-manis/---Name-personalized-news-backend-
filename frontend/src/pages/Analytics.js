import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import './HomeModern.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/analytics`, {
        headers: {
          'x-auth-token': token,
        },
      });
      setAnalytics(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch analytics');
      setLoading(false);
    }
  };

  // Prepare chart data
  const topicLabels = analytics?.topicsCovered || [];
  const topicCounts = analytics?.topicPreferences?.map(t => t.count) || [];
  const topicNames = analytics?.topicPreferences?.map(t => t.name) || [];

  const barData = {
    labels: topicNames,
    datasets: [
      {
        label: t('Articles Read'),
        data: topicCounts,
        backgroundColor: 'rgba(59,130,246,0.7)',
      },
    ],
  };

  const pieData = {
    labels: topicNames,
    datasets: [
      {
        label: t('Articles by Topic'),
        data: topicCounts,
        backgroundColor: [
          '#fbbf24', '#60a5fa', '#34d399', '#f87171', '#a78bfa', '#f472b6', '#facc15', '#38bdf8'
        ],
      },
    ],
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
      <h1 className="text-4xl font-extrabold text-primary-700 mb-10 tracking-tight drop-shadow">{t('Reading Analytics')}</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Reading Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100">
          <h2 className="text-xl font-bold text-primary-700 mb-6">{t('Reading Statistics')}</h2>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-4">
              <span className="inline-block h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 shadow">{analytics?.totalArticlesRead || 0}</span>
              <div>
                <p className="text-sm text-gray-500">{t('Total Articles Read')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-block h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-600 shadow">{analytics?.totalTimeSpent || 0}</span>
              <div>
                <p className="text-sm text-gray-500">{t('Total Time Spent')}</p>
                <span className="text-xs text-gray-400">{t('min')}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-block h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600 shadow">{analytics?.savedArticles || 0}</span>
              <div>
                <p className="text-sm text-gray-500">{t('Articles Saved')}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Topic Preferences Bar Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col border border-gray-100">
          <h2 className="text-xl font-bold text-primary-700 mb-6">{t('Topic Preferences')}</h2>
          {topicNames.length > 0 ? (
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false }, title: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} />
          ) : (
            <p className="text-gray-500">{t('No topic data yet.')}</p>
          )}
        </div>
        {/* Topic Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col border border-gray-100">
          <h2 className="text-xl font-bold text-primary-700 mb-6">{t('Topic Distribution')}</h2>
          {topicNames.length > 0 ? (
            <Pie data={pieData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' }, title: { display: false } }
            }} />
          ) : (
            <p className="text-gray-500">{t('No topic data yet.')}</p>
          )}
        </div>
      </div>
      {/* Reading Insights */}
      <div className="mt-10 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-xl font-bold text-primary-700 mb-6">{t('Reading Insights')}</h2>
        <div className="space-y-4">
          {analytics?.insights?.map((insight, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
} 