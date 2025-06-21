import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookmarkIcon, ChatBubbleLeftIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon, FireIcon, XMarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import './HomeModern.css';
import ArticleCard from '../components/ArticleCard';
import AIAssistantPanel from '../components/AIAssistantPanel';
import TrendingPanel from '../components/TrendingPanel';
import { useArticles } from '../hooks/useArticles';
import { useTrending } from '../hooks/useTrending';
import { ArticleCardSkeleton, SearchFormSkeleton, LoadingSpinner } from '../components/LoadingSkeleton';

export default function Home() {
  const {
    articles,
    nextPage,
    loading,
    loadingMore,
    fetchArticles,
    loadMoreArticles,
    setArticles,
    setNextPage,
  } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [dailyBriefing, setDailyBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(true);
  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchSummary, setSearchSummary] = useState('');
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [category, setCategory] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { t } = useTranslation();
  const [externalLikes, setExternalLikes] = useState([]); // NewsAPI liked URLs
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const [trendingPanelOpen, setTrendingPanelOpen] = useState(false);
  const [selectedTrending, setSelectedTrending] = useState(null);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const observer = useRef();
  const lastArticleRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPage) {
        loadMoreArticles();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, nextPage]);
  const {
    trending,
    loadingTrending,
    fetchTrending,
    setTrending,
  } = useTrending();

  useEffect(() => {
    fetchArticles();
    // Fetch external likes and user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: { 'x-auth-token': token },
        });
        setExternalLikes(res.data.externalLikes || []);
        setUserProfile(res.data);
      } catch (err) {
        // ignore
      }
    };
    fetchProfile();
  }, []);
  
  useEffect(() => {
    const socket = io('http://localhost:5000'); // or your backend URL

    socket.on('new-article', (article) => {
      setArticles((prev) => [article, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications`, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Get user ID from token (assumes JWT with sub or id field)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id || payload.sub || null);
      } catch (e) {
        setUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch trending articles
    const fetchTrending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/trending`, {
          headers: { 'x-auth-token': token },
        });
        setTrending(res.data);
      } catch (err) {
        // Optionally toast error
      }
    };
    fetchTrending();
    fetchDailyBriefing();
  }, []);

  const fetchDailyBriefing = async () => {
    setBriefingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/ai/daily-briefing`, {
        headers: { 'x-auth-token': token },
      });
      setDailyBriefing(res.data.briefing);
    } catch (err) {
      setDailyBriefing('Failed to load the daily briefing. Please try again later.');
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleSaveArticle = async (article) => {
    try {
      const token = localStorage.getItem('token');
      if (article._id) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/news/article/${article._id}/save`,
          {},
          { headers: { 'x-auth-token': token } }
        );
        toast.success('Article saved successfully');
      } else {
        // NewsAPI/newsdata.io article
        const url = article.url || article.link;
        console.log('Sending bookmark for external article with url:', url);
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
          toast.error('No valid URL for this article.');
          return;
        }
        await axios.post(`${process.env.REACT_APP_API_URL}/api/news/external/bookmark`, { url }, { headers: { 'x-auth-token': token } });
        toast.success('Bookmarked!');
      }
    } catch (err) {
      toast.error('Failed to save article');
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/qa`,
        {
          question,
          context: selectedArticle.content,
        },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      setAnswer(res.data.answer);
    } catch (err) {
      toast.error('Failed to get answer');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);
      if (mediaType) params.append('mediaType', mediaType);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/news/search?${params.toString()}`,
        { headers: { 'x-auth-token': token } }
      );
      setSearchResults(res.data.articles);
      setSearchSummary(res.data.summary);
    } catch (err) {
      toast.error('Failed to search');
    } finally {
      setSearching(false);
    }
  };

  const handleBackToFeed = () => {
    setSearchResults(null);
    setSearchSummary('');
    setQuery('');
  };

  const handleLikeArticle = async (article) => {
    try {
      const token = localStorage.getItem('token');
      if (article._id) {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/news/article/${article._id}/like`,
          {},
          { headers: { 'x-auth-token': token } }
        );
        setArticles((prev) =>
          prev.map((a) =>
            a._id === article._id ? { ...a, likes: res.data.likes } : a
          )
        );
        if (searchResults) {
          setSearchResults((prev) =>
            prev.map((a) =>
              a._id === article._id ? { ...a, likes: res.data.likes } : a
            )
          );
        }
      } else {
        // NewsAPI/newsdata.io article
        const url = article.url || article.link;
        console.log('Sending like for external article with url:', url);
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
          toast.error('No valid URL for this article.');
          return;
        }
        if (externalLikes.includes(url)) {
          await axios.delete(`${process.env.REACT_APP_API_URL}/api/news/external/like`, { data: { url }, headers: { 'x-auth-token': token } });
          setExternalLikes((prev) => prev.filter((u) => u !== url));
        } else {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/news/external/like`, { url }, { headers: { 'x-auth-token': token } });
          setExternalLikes((prev) => [...prev, url]);
        }
      }
    } catch (err) {
      toast.error('Failed to like article');
    }
  };

  // Helper for greeting
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // Helper for sharing (copy link)
  const handleShare = (url) => {
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  if (loading) {
    return (
      <div className="modern-bg min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                M
              </div>
              <div>
                <span className="text-base font-medium text-gray-400 dark:text-gray-300">
                  Good morning, <span className="font-bold text-primary-600 dark:text-primary-300">Manish kumar!</span>
                </span>
              </div>
            </div>
            
            {/* Main Feed Card */}
            <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 dark:shadow dark:rounded-lg p-10 mb-10">
              <h1 className="text-3xl font-extrabold text-primary-700 dark:text-primary-200 mb-8 tracking-tight drop-shadow">{t('Your Personalized News Feed')}</h1>
              
              {/* Search Form Skeleton */}
              <SearchFormSkeleton />
              
              {/* Articles Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-extrabold text-primary-700 mb-6 tracking-tight drop-shadow">{t('Your Personalized Feed')}</h2>
                  <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                      <ArticleCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
                
                {/* AI Assistant Panel Skeleton */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 dark:shadow dark:rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-bg min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              M
            </div>
            <div>
              <span className="text-base font-medium text-gray-400 dark:text-gray-300">
                Good morning, <span className="font-bold text-primary-600 dark:text-primary-300">Manish kumar!</span>
              </span>
            </div>
          </div>
          {/* Main Feed Card */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 dark:shadow dark:rounded-lg p-10 mb-10">
            <h1 className="text-3xl font-extrabold text-primary-700 dark:text-primary-200 mb-8 tracking-tight drop-shadow">{t('Your Personalized News Feed')}</h1>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row md:items-end gap-3 w-full">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('Search news...')}
                className="h-10 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 dark:bg-gray-800 dark:text-white"
              />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-10 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{t('All Categories')}</option>
                <option value="technology">{t('Technology')}</option>
                <option value="science">{t('Science')}</option>
                <option value="business">{t('Business')}</option>
                <option value="health">{t('Health')}</option>
                <option value="entertainment">{t('Entertainment')}</option>
                <option value="sports">{t('Sports')}</option>
                <option value="politics">{t('Politics')}</option>
                <option value="education">{t('Education')}</option>
              </select>
              <select
                value={mediaType}
                onChange={e => setMediaType(e.target.value)}
                className="h-10 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{t('All Media')}</option>
                <option value="text">{t('Text')}</option>
                <option value="image">{t('Image')}</option>
                <option value="video">{t('Video')}</option>
                <option value="podcast">{t('Podcast')}</option>
              </select>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText={t('Start Date')}
                className="h-10 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 text-sm dark:bg-gray-800 dark:text-white"
                dateFormat="yyyy-MM-dd"
                isClearable
              />
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText={t('End Date')}
                className="h-10 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 text-sm dark:bg-gray-800 dark:text-white"
                dateFormat="yyyy-MM-dd"
                isClearable
              />
              <button
                type="submit"
                className="h-10 px-6 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 whitespace-nowrap flex-shrink-0"
                disabled={searching}
              >
                {searching ? t('Searching...') : t('Search')}
              </button>
            </form>

            {/* Trending Horizontal Scroll Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary-700 dark:text-primary-200 flex items-center"><FireIcon className="h-6 w-6 mr-2 text-orange-500" /> {t('Trending')}</h2>
                <button
                  className="text-primary-600 dark:text-primary-300 font-semibold hover:underline text-sm px-3 py-1 rounded focus:outline-none"
                  onClick={() => { setShowAllTrending(true); setTrendingPanelOpen(true); }}
                >
                  {t('See All Trending')}
                </button>
              </div>
              {trending.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">{t('No trending topics right now.')}</p>
              ) : (
                <TrendingPanel trending={trending} t={t} showAllTrending={showAllTrending} setShowAllTrending={setShowAllTrending} />
              )}
            </div>

            {/* Trending Side Panel */}
            {trendingPanelOpen && (
              <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30" onClick={() => setTrendingPanelOpen(false)}>
                <div
                  className="w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto relative animate-slide-in-right"
                  onClick={e => e.stopPropagation()}
                  tabIndex={-1}
                  aria-modal="true"
                  role="dialog"
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 focus:outline-none"
                    onClick={() => setTrendingPanelOpen(false)}
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-7 w-7" />
                  </button>
                  {showAllTrending ? (
                    <>
                      <h2 className="text-2xl font-bold text-primary-700 mb-6">{t('All Trending Articles')}</h2>
                      <div className="space-y-6">
                        {trending.map((article, idx) => (
                          <div key={article._id || article.url || article.link || idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md border border-blue-100 p-4 mb-2">
                            <div className="flex gap-4">
                              {(() => { const imgSrc = article.image_url || article.imageUrl || article.urlToImage; return imgSrc ? (
                                <img src={imgSrc} alt={article.title} className="w-24 h-24 object-cover rounded-lg" />
                              ) : (
                                <div className="w-24 h-24 flex items-center justify-center text-4xl text-gray-300 bg-gray-100 rounded-lg">📰</div>
                              ); })()}
                              <div className="flex-1 flex flex-col">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow mb-2">
                                  {article.category || article.source?.name || 'Trending'}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{article.title}</h3>
                                <span className="text-xs text-gray-400 mb-1">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                                {article.source?.name && <span className="text-xs text-blue-700 font-semibold mb-1">{article.source.name}</span>}
                                <div className="flex gap-2 mt-auto">
                                  <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline font-semibold">Read</a>
                                  <button onClick={() => handleShare(article.url || article.link)} className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"><ShareIcon className="h-4 w-4" />Share</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : selectedTrending && (
                    <>
                      <div className="flex flex-col items-center mb-6">
                        {(() => { const imgSrc = selectedTrending.image_url || selectedTrending.imageUrl || selectedTrending.urlToImage; return imgSrc ? (
                          <img src={imgSrc} alt={selectedTrending.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center text-6xl text-gray-300 mb-4">📰</div>
                        ); })()}
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow mb-2">
                          {selectedTrending.category || selectedTrending.source?.name || 'Trending'}
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{selectedTrending.title}</h2>
                        <span className="text-xs text-gray-400 mb-1">{selectedTrending.publishedAt ? new Date(selectedTrending.publishedAt).toLocaleDateString() : ''}</span>
                        {selectedTrending.source?.name && <span className="text-xs text-blue-700 font-semibold mb-1">{selectedTrending.source.name}</span>}
                        <div className="flex gap-2 mt-2">
                          <a href={selectedTrending.url || selectedTrending.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline font-semibold">Read</a>
                          <button onClick={() => handleShare(selectedTrending.url || selectedTrending.link)} className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"><ShareIcon className="h-4 w-4" />Share</button>
                        </div>
                      </div>
                      <div className="text-gray-700 text-base mb-4 whitespace-pre-line">{selectedTrending.description || selectedTrending.summary || ''}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Show search results if searching, else show feed */}
            {searchResults ? (
              <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 dark:shadow dark:rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Search Results</h2>
                  <button onClick={handleBackToFeed} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    Back to Feed
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{searchSummary}</p>
                <div className="space-y-4">
                  {searchResults.map((article, index) => (
                    <ArticleCard key={article.article_id || article._id || index} article={article} onSave={handleSaveArticle} onLike={handleLikeArticle} isLiked={externalLikes.includes(article.link)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Articles Feed */}
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-extrabold text-primary-700 mb-6 tracking-tight drop-shadow">{t('Your Personalized Feed')}</h2>
                  <div className="space-y-8">
                    {articles.map((article, idx) => {
                      const isLast = idx === articles.length - 1;
                      return (
                        <div
                          key={article._id || article.url || article.link || idx}
                          ref={isLast ? lastArticleRef : undefined}
                          className="relative group bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-800 overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-3xl hover:border-blue-400"
                          style={{ borderLeft: `8px solid #6366f1` }}
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="flex-shrink-0 w-full md:w-56 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                              {(() => { const imgSrc = article.image_url || article.imageUrl || article.urlToImage; return imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={article.title}
                                  className="w-full h-full object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-t-none"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                                  <span role="img" aria-label="news">📰</span>
                                </div>
                              ); })()}
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow">
                                    {article.category || article.source?.name || 'General'}
                                  </span>
                                  {article.videoUrl && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700"><svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" /></svg>Video</span>}
                                  {article.podcastUrl && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15A7.963 7.963 0 0020 12c0-4.418-3.582-8-8-8S4 7.582 4 12c0 1.042.2 2.04.56 2.95" /></svg>Podcast</span>}
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-700 transition-colors duration-200">
                                  {article._id ? (
                                    <Link to={`/article/${article._id}`}>{article.title}</Link>
                                  ) : (
                                    <Link to="/external-article" state={{ article }}>{article.title}</Link>
                                  )}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed line-clamp-3">{article.summary || article.description}</p>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {article.source?.name && <span className="font-semibold text-blue-700 dark:text-blue-300">{article.source.name}</span>}
                                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={article.url || article.link || `/article/${article._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold shadow hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 transition"
                                  >
                                    Read
                                  </a>
                                  <button
                                    onClick={() => handleLikeArticle(article)}
                                    className={`text-sm flex items-center gap-1 ${article._id ? (userId && article.likes && article.likes.includes(userId) ? 'text-red-500' : 'text-gray-400') : (externalLikes.includes(article.url) ? 'text-red-500' : 'text-gray-400')} hover:text-red-600`}
                                    title={article._id ? (userId && article.likes && article.likes.includes(userId) ? 'Unlike' : 'Like') : (externalLikes.includes(article.url) ? 'Unlike' : 'Like')}
                                  >
                                    <HeartIcon className="h-5 w-5" />
                                    {article._id ? (article.likes ? article.likes.length : 0) : ''}
                                  </button>
                                  <button
                                    onClick={() => handleSaveArticle(article)}
                                    className="text-gray-400 hover:text-primary-600"
                                  >
                                    <BookmarkIcon className="h-6 w-6" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {loadingMore && (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  )}
                  {/* End-of-feed message */}
                  {!loadingMore && nextPage === null && articles.length > 0 && (
                    <div className="flex justify-center items-center py-8 fade-in">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-primary-700 rounded-full px-6 py-2 shadow font-semibold text-lg border border-blue-200">
                        🎉 {t('You have reached the end of your feed!')}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Assistant Panel */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <AIAssistantPanel briefingLoading={briefingLoading} dailyBriefing={dailyBriefing} fetchDailyBriefing={fetchDailyBriefing} t={t} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 