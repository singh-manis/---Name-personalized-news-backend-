const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Article = require('../models/Article');

// @route   GET api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('readingHistory.articleId', 'title');
    console.log('DEBUG readingHistory:', JSON.stringify(user.readingHistory, null, 2));
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, interests, learningGoals, bio, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (interests) user.interests = interests;
    if (learningGoals) user.learningGoals = learningGoals;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  const { dailyDigest, digestTime, notificationSettings } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    if (dailyDigest !== undefined) user.preferences.dailyDigest = dailyDigest;
    if (digestTime) user.preferences.digestTime = digestTime;
    if (notificationSettings) user.preferences.notificationSettings = notificationSettings;

    await user.save();
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/analytics
// @desc    Get user reading analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('readingHistory.articleId')
      .populate('savedArticles');

    // Merge local and external reading histories
    const localHistory = user.readingHistory.map(h => ({
      type: 'local',
      category: h.articleId?.category,
      title: h.articleId?.title,
      readAt: h.readAt,
      timeSpent: h.timeSpent || 0,
      _id: h.articleId?._id,
    }));
    const externalHistory = (user.externalReadingHistory || []).map(h => ({
      type: 'external',
      category: h.category || h.source || 'External',
      title: h.title,
      readAt: h.readAt,
      timeSpent: 0, // Not tracked for external
      url: h.url,
    }));
    const allHistory = [...localHistory, ...externalHistory];

    // Aggregate topic preferences (by category or source)
    const topicCountMap = {};
    allHistory.forEach(h => {
      const cat = h.category;
      if (cat) topicCountMap[cat] = (topicCountMap[cat] || 0) + 1;
    });
    const topicPreferences = Object.entries(topicCountMap).map(([name, count]) => ({ name, count }));

    // Recent activity (last 5 articles read, newest first)
    const recentActivity = allHistory
      .filter(h => h.readAt)
      .sort((a, b) => new Date(b.readAt) - new Date(a.readAt))
      .slice(0, 5)
      .map(h => ({
        _id: h._id || h.url,
        title: h.title,
        date: h.readAt,
        type: h.type === 'local' ? 'Read (Local)' : 'Read (NewsAPI)'
      }));

    const analytics = {
      totalArticlesRead: allHistory.length,
      totalTimeSpent: localHistory.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0),
      savedArticles: user.savedArticles.length + (user.externalBookmarks?.length || 0),
      topicsCovered: [...new Set(allHistory.map(h => h.category).filter(Boolean))],
      topicPreferences,
      recentActivity,
      knowledgeBase: user.knowledgeBase,
      insights: [] // You can add insights logic here if desired
    };

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/knowledge-base
// @desc    Get user's knowledge base
// @access  Private
router.get('/knowledge-base', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.knowledgeBase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/user/knowledge-base
// @desc    Add entry to knowledge base
// @access  Private
router.post('/knowledge-base', auth, async (req, res) => {
  const { topic, notes } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    user.knowledgeBase.push({
      topic,
      notes,
      lastUpdated: new Date()
    });

    await user.save();
    res.json(user.knowledgeBase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/knowledge-base/:id
// @desc    Update knowledge base entry
// @access  Private
router.put('/knowledge-base/:id', auth, async (req, res) => {
  const { topic, notes } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const entryIndex = user.knowledgeBase.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (entryIndex === -1) {
      return res.status(404).json({ msg: 'Knowledge base entry not found' });
    }

    user.knowledgeBase[entryIndex].topic = topic;
    user.knowledgeBase[entryIndex].notes = notes;
    user.knowledgeBase[entryIndex].lastUpdated = new Date();

    await user.save();
    res.json(user.knowledgeBase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/user/knowledge-base/:id
// @desc    Delete knowledge base entry
// @access  Private
router.delete('/knowledge-base/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const entryIndex = user.knowledgeBase.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (entryIndex === -1) {
      return res.status(404).json({ msg: 'Knowledge base entry not found' });
    }

    user.knowledgeBase.splice(entryIndex, 1);
    await user.save();
    res.json(user.knowledgeBase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get notifications for user
router.get('/notifications', auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark notification as read
router.post('/notifications/:id/read', auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// @route   POST api/news/article/:id/save
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

// @route   DELETE api/user/history/:articleId
// @desc    Remove an article from reading history
// @access  Private
router.delete('/history/:articleId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.readingHistory = user.readingHistory.filter(
      (entry) => entry.articleId.toString() !== req.params.articleId
    );
    await user.save();
    res.json({ msg: 'History entry removed', readingHistory: user.readingHistory });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NewsAPI/external article reading history endpoints ---

// Add to external reading history
router.post('/external-history', auth, async (req, res) => {
  const { url, title, imageUrl, source } = req.body;
  if (!url || !title) return res.status(400).json({ msg: 'URL and title required' });
  const user = await User.findById(req.user.id);
  // Prevent duplicates
  if (!user.externalReadingHistory.some(e => e.url === url)) {
    user.externalReadingHistory.push({ url, title, imageUrl, source, readAt: new Date() });
    await user.save();
  }
  res.json({ msg: 'Added to reading history' });
});

// Get external reading history
router.get('/external-history', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.externalReadingHistory || []);
});

// Delete from external reading history
router.delete('/external-history', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ msg: 'URL required' });
  const user = await User.findById(req.user.id);
  user.externalReadingHistory = user.externalReadingHistory.filter(e => e.url !== url);
  await user.save();
  res.json({ msg: 'Removed from reading history' });
});

module.exports = router; 