import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { HeartIcon, BookmarkIcon, ChatBubbleLeftEllipsisIcon, ArrowLeftIcon, GlobeAltIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import './HomeModern.css';

export default function ExternalArticle() {
  const { state } = useLocation();
  const article = state?.article;
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [factChecking, setFactChecking] = useState(false);
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('hi');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!article) return;
    // Add to external reading history
    const url = article.url || article.link;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return;
    axios.post(`${process.env.REACT_APP_API_URL}/api/user/external-history`, {
      url,
      title: article.title,
      imageUrl: article.image_url || article.imageUrl || article.urlToImage,
      source: article.source?.name
    }, { headers: { 'x-auth-token': token } });
    // Fetch like/bookmark status
    axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, { headers: { 'x-auth-token': token } })
      .then(res => {
        setLiked(res.data.externalLikes?.includes(url));
        setBookmarked(res.data.externalBookmarks?.includes(url));
      });
    // Fetch comments
    axios.get(`${process.env.REACT_APP_API_URL}/api/news/external/comments`, {
      params: { url },
      headers: { 'x-auth-token': token }
    }).then(res => setComments(res.data));
  }, [article, refresh, token]);

  if (!article) {
    return (
      <div className="modern-bg min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700">Go Back</button>
        </div>
      </div>
    );
  }

  const displayDate = article.publishedAt && !isNaN(new Date(article.publishedAt))
    ? new Date(article.publishedAt).toLocaleDateString()
    : null;
    
  const displayContent = article.description || (article.content && !article.content.includes('[+') ? article.content : '');
  const isContentTruncated = article.content && article.content.includes('[+');
  const originalUrl = article.link || article.url;

  // --- Handlers ---
  const handleLike = async () => {
    try {
      if (liked) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/news/external/like`, { data: { url: article.url || article.link }, headers: { 'x-auth-token': token } });
        setLiked(false);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/news/external/like`, { url: article.url || article.link }, { headers: { 'x-auth-token': token } });
        setLiked(true);
      }
    } catch (err) { toast.error('Failed to update like'); }
  };
  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/news/external/bookmark`, { data: { url: article.url || article.link }, headers: { 'x-auth-token': token } });
        setBookmarked(false);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/news/external/bookmark`, { url: article.url || article.link }, { headers: { 'x-auth-token': token } });
        setBookmarked(true);
      }
    } catch (err) { toast.error('Failed to update bookmark'); }
  };
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAiLoading(true);
    setAnswer('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/qa`, {
        question,
        context: displayContent
      }, { headers: { 'x-auth-token': token } });
      setAnswer(res.data.answer || res.data.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } catch (err) {
      toast.error('AI failed');
    } finally {
      setAiLoading(false);
    }
  };
  const handleFactCheck = async () => {
    setFactChecking(true);
    setFactCheckResult(null);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/fact-check`, {
        content: displayContent
      }, { headers: { 'x-auth-token': token } });
      setFactCheckResult(res.data);
    } catch (err) {
      toast.error('Fact-check failed');
    } finally {
      setFactChecking(false);
    }
  };
  const handleTranslate = async () => {
    setTranslating(true);
    setTranslated('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/translate`, {
        text: displayContent,
        targetLang
      }, { headers: { 'x-auth-token': token } });
      setTranslated(res.data.translation);
    } catch (err) {
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    const url = article.url || article.link;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      toast.error('No valid URL for this article.');
      setCommentLoading(false);
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/news/external/comment`, {
        url,
        content: commentText
      }, { headers: { 'x-auth-token': token } });
      setCommentText('');
      setRefresh(r => !r);
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="modern-bg min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-6 font-semibold"><ArrowLeftIcon className="h-5 w-5 mr-2" />Back</button>
          
          {(article.image_url || article.imageUrl || article.urlToImage) && (
            <img src={article.image_url || article.imageUrl || article.urlToImage} alt={article.title} className="w-full h-auto max-h-80 object-cover rounded-xl mb-6 shadow-lg" />
          )}

          <h1 className="text-3xl font-extrabold text-primary-700 mb-4 tracking-tight drop-shadow">{article.title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-y-2 mb-6 text-sm">
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-primary-100 text-primary-800">
                {article.source?.name || 'External Source'}
                </span>
                {displayDate && <span className="text-gray-500">{displayDate}</span>}
            </div>
            <div className="flex items-center gap-1">
                <button onClick={handleLike} className={`p-2 rounded-full ${liked ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:bg-gray-100'} transition-colors`} title={liked ? 'Unlike' : 'Like'}><HeartIcon className="h-6 w-6" /></button>
                <button onClick={handleBookmark} className={`p-2 rounded-full ${bookmarked ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:bg-gray-100'} transition-colors`} title={bookmarked ? 'Unbookmark' : 'Bookmark'}><BookmarkIcon className="h-6 w-6" /></button>
            </div>
          </div>
          
          {displayContent && (
            <div className="prose prose-lg max-w-none text-gray-800 mb-6">
              <p>{displayContent}</p>
            </div>
          )}
          
          {isContentTruncated && (
            <div className="my-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                <p className="font-bold">Full content is not available here.</p>
                <p className="text-sm">This is a preview. The complete article is on the original publisher's website.</p>
            </div>
          )}

          {originalUrl && (
            <div className="my-6">
              <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  <GlobeAltIcon className="h-5 w-5" />
                  Read Original Article
              </a>
            </div>
          )}

          {/* --- AI/Comments Sections --- */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            {/* --- AI Q&A Section --- */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2"><ChatBubbleLeftEllipsisIcon className="h-6 w-6" /> AI Assistant</h2>
              <form onSubmit={handleAskAI} className="flex flex-col gap-3 mb-3">
                <textarea className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full" rows={2} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question about this article..." />
                <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 w-fit self-start" disabled={aiLoading}>{aiLoading ? 'Asking...' : 'Ask AI'}</button>
              </form>
              {answer && (
                <div className="prose prose-lg max-w-none bg-blue-50 rounded-lg p-4 text-blue-900 mb-4">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              )}
              <button onClick={handleFactCheck} className="px-4 py-2 rounded-md bg-green-100 text-green-800 font-semibold hover:bg-green-200 flex items-center gap-2" disabled={factChecking}>{factChecking ? 'Fact-checking...' : <><CheckBadgeIcon className="h-5 w-5" /> Fact-Check</>}</button>
              
              {factCheckResult && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Fact-Check Result</h3>
                  <div className="mb-3">
                    <span className="font-semibold text-gray-700">Verdict: </span>
                    <span className={`px-2 py-1 text-sm font-bold rounded-full ${
                      {
                        "Accurate": "bg-green-100 text-green-800",
                        "Mostly Accurate": "bg-green-100 text-green-800",
                        "Mixed": "bg-yellow-100 text-yellow-800",
                        "Mostly Inaccurate": "bg-red-100 text-red-800",
                        "Inaccurate": "bg-red-100 text-red-800",
                        "Unverifiable": "bg-gray-100 text-gray-800",
                        "Parsing Failed": "bg-red-100 text-red-800",
                      }[factCheckResult.verdict] || 'bg-gray-100 text-gray-800'
                    }`}>{factCheckResult.verdict}</span>
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{factCheckResult.summary}"</p>
                  
                  {factCheckResult.claims && factCheckResult.claims.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Detailed Claims Analysis:</h4>
                      <ul className="space-y-3">
                        {factCheckResult.claims.map((item, index) => (
                          <li key={index} className={`border-l-4 p-3 rounded-r-lg ${
                            {
                              "Accurate": "border-green-500 bg-green-50",
                              "Inaccurate": "border-red-500 bg-red-50",
                              "Unverifiable": "border-gray-400 bg-gray-100",
                              "Error": "border-red-500 bg-red-50",
                            }[item.verdict] || 'border-gray-400 bg-gray-100'
                          }`}>
                            <p className="font-semibold text-gray-800">Claim: <span className="font-normal">"{item.claim}"</span></p>
                            <p className="text-gray-700 mt-1"><strong>Evaluation:</strong> {item.evaluation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- Translation Section --- */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2"><GlobeAltIcon className="h-6 w-6" /> Translate</h2>
              <div className="flex gap-2 mb-3">
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="zh">Chinese</option>
                  <option value="de">German</option>
                  <option value="ar">Arabic</option>
                </select>
                <button onClick={handleTranslate} className="px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700" disabled={translating}>{translating ? 'Translating...' : 'Translate'}</button>
              </div>
              {translated && <div className="bg-yellow-50 rounded-lg p-4 text-yellow-900 whitespace-pre-line">{translated}</div>}
            </div>

            {/* --- Comments Section --- */}
            <div>
              <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2"><ChatBubbleLeftEllipsisIcon className="h-6 w-6" /> Comments</h2>
              <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Add a comment..." disabled={commentLoading} />
                <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700" disabled={commentLoading || !commentText.trim()}>{commentLoading ? 'Posting...' : 'Post'}</button>
              </form>
              <div className="space-y-4">
                {comments.length === 0 ? <div className="text-gray-500">No comments yet.</div> : comments.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 shadow-sm">
                    {c.user?.profilePicture ? <img src={c.user.profilePicture} alt="profile" className="h-10 w-10 rounded-full object-cover" /> : <span className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">{c.user?.name?.[0]?.toUpperCase() || '?'}</span>}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-base">{c.user?.name || 'User'}</span>
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 