import React from 'react';
import { FireIcon } from '@heroicons/react/24/outline';

const TrendingPanel = ({ trending, t, showAllTrending, setShowAllTrending }) => (
  <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 dark:shadow dark:rounded-lg p-6 mt-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
        <FireIcon className="w-6 h-6 mr-2 text-red-500" />
        {t('Trending')}
      </h3>
      <button
        onClick={() => setShowAllTrending((v) => !v)}
        className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-semibold"
      >
        {showAllTrending ? t('Show Less') : t('See All Trending')}
      </button>
    </div>
    <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
      {(showAllTrending ? trending : trending.slice(0, 5)).map((article, idx) => (
        <div
          key={article._id || article.url || article.link || idx}
          className="min-w-[320px] max-w-xs bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md border border-blue-100 dark:border-gray-800 flex-shrink-0 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          tabIndex={0}
          aria-label={article.title}
        >
          {(() => { const imgSrc = article.image_url || article.imageUrl || article.urlToImage; return imgSrc ? (
            <img src={imgSrc} alt={article.title} className="w-full h-32 object-cover rounded-t-xl" />
          ) : (
            <div className="w-full h-32 flex items-center justify-center text-4xl text-gray-300">📰</div>
          ); })()}
          <div className="p-4 flex flex-col gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow">
              {article.category || article.source?.name || 'Trending'}
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">{article.title}</h3>
            <span className="text-xs text-gray-400 dark:text-gray-300">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
            {article.source?.name && <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">{article.source.name}</span>}
            <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-primary-600 dark:text-primary-300 hover:underline font-semibold">Read</a>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrendingPanel; 