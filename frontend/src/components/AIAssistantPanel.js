import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

const AIAssistantPanel = ({ briefingLoading, dailyBriefing, fetchDailyBriefing, t }) => (
  <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 dark:shadow dark:rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 mr-2" />
        {t('ai_assistant')}
      </h3>
      <button
        onClick={fetchDailyBriefing}
        disabled={briefingLoading}
        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
        aria-label="Refresh Briefing"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${briefingLoading ? 'animate-spin' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.18 3.182v4.992" />
        </svg>
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-200 prose prose-sm max-w-none prose-p:my-1 prose-headings:text-gray-700 dark:prose-headings:text-gray-300">
      {briefingLoading ? (
        <p>{t('loading_briefing')}</p>
      ) : (
        <ReactMarkdown>{dailyBriefing}</ReactMarkdown>
      )}
    </div>
  </div>
);

export default AIAssistantPanel; 