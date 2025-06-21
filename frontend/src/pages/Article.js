import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookmarkIcon, ChatBubbleLeftIcon, ArrowLeftIcon, MicrophoneIcon, SpeakerWaveIcon, XMarkIcon, UserIcon, GlobeAltIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import './HomeModern.css';

export default function Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [complexity, setComplexity] = useState('intermediate');
  const [explanation, setExplanation] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('hi');
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translatedComments, setTranslatedComments] = useState({});
  const [translatingComments, setTranslatingComments] = useState({});
  const [commentsSummary, setCommentsSummary] = useState('');
  const [summarizingComments, setSummarizingComments] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [factChecking, setFactChecking] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/article/${id}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      setArticle(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch article');
      setLoading(false);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/news/article/${id}/save`,
        {},
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      toast.success('Article saved successfully');
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
          context: article.content,
        },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      setAnswer(
        res.data.answer ||
        res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        ''
      );
    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        'Failed to get answer'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!article?.title || !complexity) {
      toast.error('Please select an article and explanation level.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/explain`,
        {
          question: `${article.title} (${complexity})`,
        },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      console.log('AI explain response:', res.data);
      // Try direct explanation, then Gemini nested structure
      setExplanation(
        res.data.explanation ||
        res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        ''
      );
    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        'Failed to get explanation'
      );
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
    };
    recognition.start();
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/news/article/${id}/comment`,
        { content: commentText },
        { headers: { 'x-auth-token': token } }
      );
      setArticle((prev) => ({ ...prev, comments: res.data }));
      setCommentText('');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleTranslate = async () => {
    if (!article?.content) return;
    setTranslating(true);
    setTranslatedContent('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/translate`,
        { text: article.content, targetLang },
        { headers: { 'x-auth-token': token } }
      );
      setTranslatedContent(res.data.translation);
    } catch (err) {
      toast.error(
        err.response?.data?.msg || err.response?.data?.error || 'Translation failed'
      );
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateTitle = async () => {
    if (!article?.title) return;
    setTranslatingTitle(true);
    setTranslatedTitle('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/translate`,
        { text: article.title, targetLang },
        { headers: { 'x-auth-token': token } }
      );
      setTranslatedTitle(res.data.translation);
    } catch (err) {
      toast.error(
        err.response?.data?.msg || err.response?.data?.error || 'Translation failed'
      );
    } finally {
      setTranslatingTitle(false);
    }
  };

  const handleTranslateComment = async (commentId, text) => {
    setTranslatingComments(prev => ({ ...prev, [commentId]: true }));
    setTranslatedComments(prev => ({ ...prev, [commentId]: '' }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/translate`,
        { text, targetLang },
        { headers: { 'x-auth-token': token } }
      );
      setTranslatedComments(prev => ({ ...prev, [commentId]: res.data.translation }));
    } catch (err) {
      toast.error(
        err.response?.data?.msg || err.response?.data?.error || 'Translation failed'
      );
    } finally {
      setTranslatingComments(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleSummarizeComments = async () => {
    if (!article?.comments || article.comments.length === 0) return;
    setSummarizingComments(true);
    setCommentsSummary('');
    try {
      const token = localStorage.getItem('token');
      const commentsArr = article.comments.map(c => c.content);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/summarize-comments`,
        { comments: commentsArr },
        { headers: { 'x-auth-token': token } }
      );
      setCommentsSummary(res.data.summary);
    } catch (err) {
      toast.error(
        err.response?.data?.msg || err.response?.data?.error || 'Failed to summarize comments'
      );
    } finally {
      setSummarizingComments(false);
    }
  };

  const handleFactCheck = async () => {
    if (!article?.content) return;
    setFactChecking(true);
    setFactCheckResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/fact-check`,
        { content: article.content },
        { headers: { 'x-auth-token': token } }
      );
      setFactCheckResult(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.msg || err.response?.data?.error || 'Fact-check failed'
      );
    } finally {
      setFactChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">{t('Article not found')}</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('Back to Home')}
        </button>
      </div>
    );
  }

  return (
    <div className="modern-bg min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-6 font-semibold"><ArrowLeftIcon className="h-5 w-5 mr-2" />Back</button>
          
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-80 object-cover rounded-xl mb-6 shadow-lg" />
          )}

          <h1 className="text-3xl font-extrabold text-primary-700 mb-4 tracking-tight drop-shadow">{article.title}</h1>
          
          <div className="prose prose-lg max-w-none text-gray-800 mb-6">
            <p>{article.content}</p>
          </div>

          {/* AI/Comments Sections */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            {/* --- AI Q&A Section --- */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2"><ChatBubbleLeftIcon className="h-6 w-6" /> AI Assistant</h2>
              <form onSubmit={handleAskQuestion} className="flex flex-col gap-3 mb-3">
                <textarea className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full" rows={2} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question about this article..." />
                <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 w-fit self-start" disabled={aiLoading}>{aiLoading ? 'Asking...' : 'Ask AI'}</button>
              </form>
              {answer && (
                <div className="prose prose-lg max-w-none bg-blue-50 rounded-lg p-4 text-blue-900 mb-4">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              )}
            </div>
            {/* --- Fact-Check Section --- */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2"><CheckBadgeIcon className="h-6 w-6" /> Fact-Check</h2>
              <button onClick={handleFactCheck} className="px-4 py-2 rounded-md bg-green-100 text-green-800 font-semibold hover:bg-green-200 flex items-center gap-2" disabled={factChecking}>
                {factChecking ? 'Fact-checking...' : <>Fact-Check this Article</>}
              </button>
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
                            ({
                              "Accurate": "border-green-500 bg-green-50",
                              "Inaccurate": "border-red-500 bg-red-50",
                              "Unverifiable": "border-gray-400 bg-gray-100",
                              "Error": "border-red-500 bg-red-50",
                            })[item.verdict] || 'border-gray-400 bg-gray-100'
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
            {/* Other sections like AI Assistant, Translate, Comments go here */}
          </div>
        </div>
      </div>
    </div>
  );
} 