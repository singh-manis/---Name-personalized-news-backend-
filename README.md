# Personalized News Aggregator

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel)](https://name-personalized-news-frontend.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render)](https://personalized-news-backend-ucdr.onrender.com)

A sophisticated full-stack news aggregation platform that delivers a tailored news experience to users. The application features a React-based frontend, a robust Node.js/Express backend, and leverages a Gemini-powered AI assistant to provide intelligent summaries and insights.

## Live Demo

*   **Frontend (Vercel):** [https://name-personalized-news-frontend.vercel.app/](https://name-personalized-news-frontend.vercel.app/)
*   **Backend (Render):** [https://personalized-news-backend-ucdr.onrender.com](https://personalized-news-backend-ucdr.onrender.com)

## Key Features

*   **Personalized Feed:** Users receive a news feed based on their preferred categories and sources.
*   **AI-Powered Assistant:** An integrated Gemini AI chatbot can summarize articles and answer user questions.
*   **User Authentication:** Secure user registration and login system using JWT for protected routes.
*   **Article Management:** Features for bookmarking articles and tracking reading history.
*   **Responsive Design:** A modern and clean UI built with Tailwind CSS that works seamlessly across all devices.
*   **Performance Optimized:** Implements code splitting, lazy loading, and skeleton loaders for a fast and smooth user experience.
*   **Error Handling:** Robust error boundaries in the frontend to prevent UI crashes.

## Technologies & Tools

**Frontend:**
*   React.js
*   Tailwind CSS
*   React Router
*   Axios
*   i18next (for internationalization)

**Backend:**
*   Node.js
*   Express.js
*   MongoDB (with Mongoose)
*   JSON Web Tokens (JWT)
*   Google Gemini API

**DevOps & Deployment:**
*   Vercel (Frontend)
*   Render (Backend)
*   Git & GitHub

## Local Development Setup

To run this project on your local machine, follow the steps below.

### Prerequisites

*   Node.js (v14 or later)
*   npm
*   MongoDB instance (local or a cloud service like MongoDB Atlas)
*   Git

### 1. Clone the Repository

```bash
git clone https://github.com/singh-manis/---Name-personalized-news-backend-.git
cd ---Name-personalized-news-backend-
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the necessary environment variables (see below).

```bash
# Start the backend server
npm start
```

### 3. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory and add the necessary environment variables (see below).

```bash
# Start the frontend development server
npm start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files. You can use the `env.example` file as a guide.

#### Backend (`/backend/.env`)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

#### Frontend (`/frontend/.env`)
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