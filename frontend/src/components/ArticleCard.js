import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const ArticleCard = React.memo(({ article, onSave, onLike, isLiked }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const url = article.url || article.link;

  const handleCardClick = () => {
    if (article._id) {
      navigate(`/article/${article._id}`);
    } else {
      navigate(`/external-article`, { state: { article } });
    }
  };

  return (
    <div className="relative group bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-800 overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-3xl hover:border-blue-400" style={{ borderLeft: `8px solid #6366f1` }}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 w-full md:w-56 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          {(() => { const imgSrc = article.image_url || article.imageUrl || article.urlToImage; return imgSrc ? (
            <img
              src={imgSrc}
              alt={article.title}
              className="w-full h-full object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-t-none"
              onClick={handleCardClick}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
              <span role="img" aria-label="news">📰</span>
            </div>
          ); })()}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {article.category}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); onLike(article); }}
                className={`text-sm flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-600`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <HeartIcon className="h-5 w-5" />
                {isLiked ? article.likes.length : 0}
              </button>
              <button
                onClick={e => { e.stopPropagation(); onSave(article); }}
                className="text-gray-400 hover:text-primary-600"
              >
                <BookmarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {article._id ? (
              <Link to={`/article/${article._id}`} className="hover:text-primary-600">{article.title}</Link>
            ) : (
              <Link to="/external-article" state={{ article }} className="hover:text-primary-600">{article.title}</Link>
            )}
          </h3>
          <p className="text-gray-600 mb-4">{article.summary}</p>
          <span className="text-sm text-gray-500">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard; 