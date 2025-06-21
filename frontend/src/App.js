import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoadingSkeleton } from './components/LoadingSkeleton';

// Utils
import { envConfig } from './utils/envValidation';

// Hooks
import { useTheme } from './hooks/useTheme';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Article = lazy(() => import('./pages/Article'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const ReadingHistory = lazy(() => import('./pages/ReadingHistory'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminArticleForm = lazy(() => import('./pages/AdminArticleForm'));
const ExternalArticle = lazy(() => import('./pages/ExternalArticle'));

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.style.background = '#111827'; // Tailwind gray-900
    } else {
      document.body.style.background = 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
    }
    document.body.style.minHeight = '100vh';
    document.body.style.width = '100vw';
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <div>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
            <Suspense fallback={<PageLoadingSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/article/:id" element={<PrivateRoute><Article /></PrivateRoute>} />
                <Route path="/knowledge-base" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><ReadingHistory /></PrivateRoute>} />
                <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/admin/new" element={<PrivateRoute><AdminArticleForm /></PrivateRoute>} />
                <Route path="/admin/edit/:id" element={<PrivateRoute><AdminArticleForm /></PrivateRoute>} />
                <Route path="/external-article" element={<ExternalArticle />} />
              </Routes>
            </Suspense>
          </main>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 