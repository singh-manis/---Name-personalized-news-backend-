const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  source: {
    name: String,
    url: String
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: String,
  videoUrl: String,
  podcastUrl: String,
  category: {
    type: String,
    enum: ['technology', 'science', 'business', 'health', 'entertainment', 'sports', 'politics', 'education'],
    required: true
  },
  tags: [String],
  aiMetadata: {
    relevanceScore: Number,
    complexityLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    keyConcepts: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    averageReadTime: Number
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  publishedAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ 'aiMetadata.relevanceScore': -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ title: 'text', summary: 'text', tags: 'text' });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 