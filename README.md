# Personalized News Platform

An AI-powered news and learning platform that delivers personalized content curated by Gemini AI. The platform helps users stay informed while avoiding information overload through smart curation, summarization, and interactive learning features.

## Features

- 🎯 Personalized news feed based on user interests and goals
- 🤖 AI-powered content curation and summarization
- 💡 Interactive Q&A with Gemini AI
- 📊 Learning progress tracking and analytics
- 👥 Community features and discussion boards
- 📱 Mobile-first, responsive design

## Tech Stack

- Frontend: React, Tailwind CSS, Axios
- Backend: Node.js, Express.js
- Database: MongoDB
- AI: Google Gemini AI
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud account with Gemini AI API access

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personalized-news.git
cd personalized-news
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary API keys and configuration

4. Start the development servers:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

## Project Structure

```
personalized-news/
├── frontend/           # React frontend application
├── backend/           # Express.js backend server
├── package.json       # Root package.json
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 