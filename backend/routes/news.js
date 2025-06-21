const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Article = require('../models/Article');
const User = require('../models/User');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Helper Function
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function askGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// --- In-memory cache for NewsAPI endpoints ---
// Now using newsdata.io instead of newsapi.org
const cache = {
  feed: { data: null, timestamp: 0 },
  trending: { data: null, timestamp: 0 },
  recommendations: { data: null, timestamp: 0 },
};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const NEWS_API_KEY = process.env.NEWSDATA_API_KEY;

// @route   GET api/news/feed
// @desc    Get personalized news feed (live from newsdata.io) with infinite scroll support
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const now = Date.now();
    const { nextPage } = req.query;
    // Only cache the first page (no nextPage param)
    if (!nextPage && cache.feed.data && now - cache.feed.timestamp < CACHE_DURATION) {
      return res.json(cache.feed.data);
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const interests = user.interests || [];
    let allArticles = [];
    let nextPageToken = null;
    // For infinite scroll, fetch for the first interest only (for simplicity)
    // You can expand to merge multiple interests if needed
    const interest = interests[0] || '';
    // Always include all required params, even with nextPage
    const params = {
      apikey: NEWS_API_KEY,
      q: interest,
      language: 'en',
      country: 'us',
    };
    if (nextPage) params.nextPage = nextPage;
    let response;
    try {
      response = await axios.get('https://newsdata.io/api/1/news', { params });
    } catch (err) {
      // Enhanced error logging
      console.error('Error fetching newsdata.io feed:', err?.response?.data || err.message);
      // If newsdata.io returns UnsupportedParameter, treat as end of feed
      if (err?.response?.data?.results?.code === 'UnsupportedParameter') {
        return res.json({ articles: [], nextPage: null, error: 'No more articles or unsupported nextPage.' });
      }
      return res.status(500).json({ msg: 'Failed to fetch news feed', error: err?.response?.data || err.message });
    }
    allArticles = response.data.results || [];
    nextPageToken = response.data.nextPage || null;
    // Deduplicate by article link
    const seen = new Set();
    const deduped = allArticles.filter(article => {
      if (seen.has(article.link)) return false;
      seen.add(article.link);
      return true;
    });
    const result = { articles: deduped, nextPage: nextPageToken };
    if (!nextPage) cache.feed = { data: result, timestamp: now };
    res.json(result);
  } catch (err) {
    console.error('Error fetching newsdata.io feed (outer catch):', err?.response?.data || err.message);
    res.status(500).json({ msg: 'Failed to fetch news feed', error: err.message });
  }
});

// @route   GET api/news/article/:id
// @desc    Get single article
// @access  Private
router.get('/article/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    // Update view count
    article.engagement.views += 1;
    await article.save();

    // Add to user's reading history
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        readingHistory: {
          articleId: article._id,
          readAt: new Date()
        }
      }
    });

    res.json(article);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/news/article/:id/save
// @desc    Save article to user's collection
// @access  Private
router.post('/article/:id/save', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if article is already saved
    if (user.savedArticles.includes(article._id)) {
      return res.status(400).json({ msg: 'Article already saved' });
    }

    // Add to saved articles
    user.savedArticles.push(article._id);
    await user.save();

    // Update article engagement
    article.engagement.saves += 1;
    await article.save();

    res.json({ msg: 'Article saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/news/article/:id/comment
// @desc    Add comment to article
// @access  Private
router.post('/article/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    const newComment = {
      user: req.user.id,
      content
    };

    article.comments.push(newComment);
    await article.save();

    res.json(article.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/news/saved
// @desc    Get user's saved articles
// @access  Private
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedArticles');
    res.json(user.savedArticles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/news/article
// @desc    Create a new article and emit real-time update
// @access  Private
router.post('/article', auth, async (req, res) => {
  try {
    const { title, content, summary, source, url, category, tags, aiMetadata, imageUrl, videoUrl, podcastUrl } = req.body;
    const newArticle = new Article({
      title,
      content,
      summary,
      source,
      url,
      category,
      tags,
      aiMetadata,
      imageUrl,
      videoUrl,
      podcastUrl,
      publishedAt: new Date()
    });
    await newArticle.save();
    // Emit event to all clients
    const io = req.app.get('io');
    if (io) io.emit('new-article', newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ msg: 'Error creating article', error: err.message });
  }
});

// @route   GET api/news/search
// @desc    Search articles from the live NewsData.io API and get an AI summary
// @access  Private
router.get('/search', auth, async (req, res) => {
  const { q, category, startDate, endDate } = req.query;

  if (!q) {
    return res.status(400).json({ msg: 'Search query is required' });
  }

  try {
    // 1. Fetch live articles from NewsData.io
    const params = {
      apikey: process.env.NEWSDATA_API_KEY,
      q,
      language: 'en',
    };
    if (category) params.category = category;
    // Note: newsdata.io uses `from_date` and `to_date` with YYYY-MM-DD format.
    if (startDate) params.from_date = new Date(startDate).toISOString().split('T')[0];
    if (endDate) params.to_date = new Date(endDate).toISOString().split('T')[0];

    const newsResponse = await axios.get('https://newsdata.io/api/1/news', { params });
    const articles = newsResponse.data.results || [];

    if (articles.length === 0) {
      return res.json({ articles: [], summary: 'No live results found for your query.' });
    }

    // 2. Generate AI summary of the results
    const summaryPrompt = `
      Based on the user's query and the top 5 article titles, generate a concise, one-sentence summary of the search results.

      User Query: "${q}"

      Article Titles:
      ${articles.slice(0, 5).map(a => `- ${a.title}`).join('\n')}

      Return only the one-sentence summary, with no extra text.
    `;

    const summary = await askGemini(summaryPrompt);

    res.json({ articles, summary });

  } catch (err) {
    console.error('Live Search Error:', err.response ? err.response.data : err.message);
    res.status(500).json({ msg: 'Live search failed', error: err.message });
  }
});

// @route   POST api/news/article/:id/like
// @desc    Like or unlike an article
// @access  Private
router.post('/article/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    const userId = req.user.id;
    const likedIndex = article.likes.indexOf(userId);
    if (likedIndex === -1) {
      // Not liked yet, add like
      article.likes.push(userId);
    } else {
      // Already liked, remove like (unlike)
      article.likes.splice(likedIndex, 1);
    }
    await article.save();
    res.json({ likes: article.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/news/trending
// @desc    Get trending articles (from cache or live)
// @access  Private
router.get('/trending', auth, async (req, res) => {
  try {
    const now = Date.now();
    if (cache.trending.data && now - cache.trending.timestamp < CACHE_DURATION) {
      return res.json(cache.trending.data);
    }
    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: NEWS_API_KEY,
        language: 'en',
        country: 'us',
        category: 'top',
      },
    });
    const articles = response.data.results || [];
    cache.trending = { data: articles, timestamp: now };
    res.json(articles);
  } catch (err) {
    console.error('Error fetching trending from newsdata.io:', err?.response?.data || err.message);
    res.status(500).json({ msg: 'Error fetching trending articles', error: err.message });
  }
});

// @route   GET api/news/recommendations
// @desc    Get personalized article recommendations for the user from newsdata.io
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const now = Date.now();
    if (cache.recommendations.data && now - cache.recommendations.timestamp < CACHE_DURATION) {
      return res.json(cache.recommendations.data);
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const interests = user.interests || [];
    let allArticles = [];
    for (const interest of interests) {
      const response = await axios.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: NEWS_API_KEY,
          q: interest,
          language: 'en',
          country: 'us',
        },
      });
      allArticles = allArticles.concat(response.data.results || []);
    }
    // Deduplicate by article link
    const seen = new Set();
    const deduped = allArticles.filter(article => {
      if (seen.has(article.link)) return false;
      seen.add(article.link);
      return true;
    });
    cache.recommendations = { data: deduped, timestamp: now };
    res.json(deduped);
  } catch (err) {
    console.error('Error fetching recommendations from newsdata.io:', err?.response?.data || err.message);
    res.status(500).json({ msg: 'Error fetching recommendations', error: err.message });
  }
});

// @route   DELETE api/news/article/:id/save
// @desc    Remove article from user's bookmarks
// @access  Private
router.delete('/article/:id/save', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const articleId = req.params.id;
    user.savedArticles = user.savedArticles.filter(
      (a) => a.toString() !== articleId
    );
    await user.save();
    res.json({ msg: 'Article removed from bookmarks', savedArticles: user.savedArticles });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/news/article/:id
// @desc    Delete an article by ID
// @access  Private (admin in future)
router.delete('/article/:id', auth, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.json({ msg: 'Article deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/news/article/:id
// @desc    Update an article by ID
// @access  Private (admin in future)
router.put('/article/:id', auth, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/news/all
// @desc    Get all articles (admin dashboard)
// @access  Private (admin in future)
router.get('/all', auth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NewsAPI/external article endpoints ---
// Bookmark external article
router.post('/external/bookmark', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ msg: 'URL required' });
  const user = await User.findById(req.user.id);
  if (!user.externalBookmarks.includes(url)) {
    user.externalBookmarks.push(url);
    await user.save();
  }
  res.json({ msg: 'Bookmarked' });
});
router.delete('/external/bookmark', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ msg: 'URL required' });
  const user = await User.findById(req.user.id);
  user.externalBookmarks = user.externalBookmarks.filter(u => u !== url);
  await user.save();
  res.json({ msg: 'Unbookmarked' });
});
// Like external article
router.post('/external/like', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ msg: 'URL required' });
  const user = await User.findById(req.user.id);
  if (!user.externalLikes.includes(url)) {
    user.externalLikes.push(url);
    await user.save();
  }
  res.json({ msg: 'Liked' });
});
router.delete('/external/like', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ msg: 'URL required' });
  const user = await User.findById(req.user.id);
  user.externalLikes = user.externalLikes.filter(u => u !== url);
  await user.save();
  res.json({ msg: 'Unliked' });
});
// Get comments for external article
router.get('/external/comments', auth, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ msg: 'URL required' });
  const users = await User.find({ 'externalComments.url': url }, 'externalComments name profilePicture');
  let comments = [];
  users.forEach(u => {
    const entry = u.externalComments.find(ec => ec.url === url);
    if (entry) {
      entry.comments.forEach(c => {
        comments.push({ ...c.toObject(), user: { name: u.name, profilePicture: u.profilePicture } });
      });
    }
  });
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(comments);
});
// Add comment to external article
router.post('/external/comment', auth, async (req, res) => {
  const { url, content } = req.body;
  if (!url || !content) return res.status(400).json({ msg: 'URL and content required' });
  const user = await User.findById(req.user.id);
  let entry = user.externalComments.find(ec => ec.url === url);
  if (!entry) {
    entry = { url, comments: [] };
    user.externalComments.push(entry);
  }
  entry.comments.push({ user: req.user.id, content });
  await user.save();
  res.json({ msg: 'Comment added' });
});

module.exports = router; 