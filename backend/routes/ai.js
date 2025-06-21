const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Article = require('../models/Article');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const API_KEY = process.env.GEMINI_API_KEY;
const model = "gemini-2.0-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

async function askGemini(prompt) {
  const data = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await axios.post(url, data, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data;
}

// @route   POST api/ai/summarize
// @desc    Generate AI summary of an article
// @access  Private
router.post('/summarize', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const prompt = `Please provide a concise summary of the following article, highlighting the key points and main takeaways:
    
    ${content}`;
    
    const result = await genAI.generateContent(prompt, url);
    const response = await result.response;
    const summary = response.text();
    
    res.json({ summary });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/ai/explain
// @desc    Get AI explanation of a concept
// @access  Private
router.post('/explain', auth, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ msg: 'Question is required.' });
    }
    const aiResponse = await askGemini(question);
    res.json(aiResponse);
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ msg: 'You have reached the rate limit for the AI service. Please try again later.' });
    }
    if (err.response && err.response.data && err.response.data.error) {
      return res.status(500).json({ msg: err.response.data.error.message });
    }
    console.error(err);
    res.status(500).json({ msg: 'AI request failed', error: err.message });
  }
});

// @route   POST api/ai/curate
// @desc    Get AI-curated content recommendations
// @access  Private
router.post('/curate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const prompt = `Based on the following user interests and learning goals, suggest 5 relevant topics or articles they should read about:
    
    Interests: ${user.interests.join(', ')}
    Learning Goals: ${user.learningGoals.map(goal => `${goal.topic} (${goal.level})`).join(', ')}`;
    
    const result = await genAI.generateContent(prompt, url);
    const response = await result.response;
    const recommendations = response.text();
    
    res.json({ recommendations });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/ai/qa
// @desc    Get AI answer to a question
// @access  Private
router.post('/qa', auth, async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
        return res.status(400).json({ msg: 'A question is required.' });
    }

    const prompt = `
      Based on the provided context, please answer the following question.
      Format your answer using Markdown for clear readability. Use headings, lists, and bold text where appropriate.

      Context:
      ---
      ${context || 'No context provided.'}
      ---
      Question: ${question}
    `;

    const aiResponse = await askGemini(prompt);
    const answer = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate an answer.';
    res.json({ answer });
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ msg: 'You have reached the rate limit for the AI service. Please try again later.' });
    }
    if (err.response && err.response.data && err.response.data.error) {
      return res.status(500).json({ msg: err.response.data.error.message });
    }
    console.error(err);
    res.status(500).json({ msg: 'AI request failed', error: err.message });
  }
});

// @route   POST api/ai/translate
// @desc    Translate article content using Gemini AI
// @access  Private
router.post('/translate', auth, async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ msg: 'Text and targetLang are required.' });
    }
    const prompt = `Translate the following text to ${targetLang}:

${text}`;
    const aiResponse = await askGemini(prompt);
    const translation = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ translation });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ msg: 'Translation failed', error: err.message });
  }
});

// @route   POST api/ai/summarize-comments
// @desc    Summarize article comments using Gemini AI
// @access  Private
router.post('/summarize-comments', auth, async (req, res) => {
  try {
    const { comments } = req.body;
    if (!Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ msg: 'Comments array is required.' });
    }
    const commentsText = comments.map((c, i) => `Comment ${i + 1}: ${c}`).join('\n');
    const prompt = `Summarize the following article discussion comments in a few sentences, highlighting the main points and sentiment:\n\n${commentsText}`;
    const aiResponse = await askGemini(prompt);
    const summary = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ summary });
  } catch (err) {
    console.error('Summarize comments error:', err.message);
    res.status(500).json({ msg: 'Summarization failed', error: err.message });
  }
});

// @route   POST api/ai/fact-check
// @desc    Fact-check article content using Gemini AI
// @access  Private
router.post('/fact-check', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ msg: 'Content is required.' });
    }

    const prompt = `
      Please perform a fact-check on the following article content.
      1. Identify the main factual claims made in the text.
      2. For each claim, evaluate its accuracy.
      3. Provide a brief summary of your findings.
      4. Provide an overall verdict from one of the following options: "Accurate", "Mostly Accurate", "Mixed", "Mostly Inaccurate", "Inaccurate", "Unverifiable".

      Return the result as a JSON object with the following structure. Do not include any text outside of the JSON object.
      {
        "summary": "<Your summary here>",
        "verdict": "<Your overall verdict here>",
        "claims": [
          {
            "claim": "<The first claim identified>",
            "evaluation": "<Your evaluation of the first claim>",
            "verdict": "<Accurate / Inaccurate / Unverifiable>"
          },
          {
            "claim": "<The second claim identified>",
            "evaluation": "<Your evaluation of the second claim>",
            "verdict": "<Accurate / Inaccurate / Unverifiable>"
          }
        ]
      }

      Article content to analyze:
      ---
      ${content}
      ---
    `;

    const aiResponse = await askGemini(prompt);
    let rawText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Clean the response to ensure it's valid JSON
    rawText = rawText.trim().replace(/^```json\s*/, '').replace(/```$/, '');

    try {
      const result = JSON.parse(rawText);
      res.json(result);
    } catch (parseErr) {
      console.error('Fact-check JSON parsing error:', parseErr);
      console.error('Raw AI response:', rawText);
      // Fallback for when the AI doesn't return perfect JSON
      res.status(500).json({ 
        summary: 'The AI returned a response that could not be automatically parsed.',
        verdict: 'Parsing Failed',
        claims: [{
          claim: 'Raw AI Output',
          evaluation: rawText,
          verdict: 'Error'
        }]
      });
    }
  } catch (err) {
    console.error('Fact-check error:', err.message);
    res.status(500).json({ msg: 'Fact-check failed', error: err.message });
  }
});

// @route   GET api/ai/daily-briefing
// @desc    Generate a daily news briefing using AI
// @access  Private
router.get('/daily-briefing', auth, async (req, res) => {
  try {
    // 1. Fetch top trending news from newsdata.io
    const newsResponse = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        language: 'en',
        country: 'us',
        category: 'top'
      }
    });

    const articles = newsResponse.data.results || [];
    if (articles.length === 0) {
      return res.json({ briefing: "Sorry, I couldn't fetch the latest news to generate a briefing right now." });
    }

    // 2. Prepare the content for the AI
    const briefingContent = articles.slice(0, 5).map(article => {
      return `Title: ${article.title}\nDescription: ${article.description || 'No description available.'}`;
    }).join('\n\n---\n\n');

    // 3. Create the prompt for Gemini AI
    const prompt = `
      You are an expert news analyst. Based on the following top headlines, please generate a "Daily Briefing" for a user.
      
      The briefing should:
      - Have a clear, engaging title (e.g., "Your Morning News Briefing").
      - Summarize the top 3-4 most important stories in a concise and easy-to-read way.
      - Use Markdown for formatting (headings, bold text, and bullet points).

      Here are the articles to summarize:
      ---
      ${briefingContent}
      ---
    `;

    // 4. Get the briefing from the AI
    const aiResponse = await askGemini(prompt);
    const briefing = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a briefing at this time.';
    
    res.json({ briefing });

  } catch (err) {
    console.error('Daily briefing error:', err.message);
    res.status(500).json({ msg: 'Failed to generate daily briefing', error: err.message });
  }
});

module.exports = router; 