const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  interests: [{
    type: String,
    enum: ['technology', 'science', 'business', 'health', 'entertainment', 'sports', 'politics', 'education']
  }],
  learningGoals: [{
    topic: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    targetDate: Date
  }],
  readingHistory: [{
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    readAt: Date,
    timeSpent: Number
  }],
  savedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  externalBookmarks: [String],
  externalLikes: [String],
  externalComments: [{
    url: String,
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  knowledgeBase: [{
    topic: String,
    notes: String,
    lastUpdated: Date
  }],
  preferences: {
    dailyDigest: {
      type: Boolean,
      default: true
    },
    digestTime: {
      type: String,
      default: '08:00'
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  externalReadingHistory: [{
    url: String,
    title: String,
    readAt: Date,
    imageUrl: String,
    source: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 