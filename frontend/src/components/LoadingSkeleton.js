import React from 'react';

// Article Card Skeleton
export const ArticleCardSkeleton = () => (
  <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 animate-pulse">
    <div className="flex flex-col md:flex-row">
      {/* Image skeleton */}
      <div className="flex-shrink-0 w-full md:w-56 h-48 md:h-auto bg-gray-200 dark:bg-gray-700 rounded-t-xl md:rounded-l-xl md:rounded-t-none"></div>
      
      {/* Content skeleton */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          {/* Category badge skeleton */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
          
          {/* Summary skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-4/6"></div>
          
          {/* Date skeleton */}
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Trending Card Skeleton
export const TrendingCardSkeleton = () => (
  <div className="min-w-[320px] max-w-xs bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md border border-blue-100 dark:border-gray-800 animate-pulse">
    {/* Image skeleton */}
    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
    
    {/* Content skeleton */}
    <div className="p-4 flex flex-col gap-2">
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

// Search Form Skeleton
export const SearchFormSkeleton = () => (
  <div className="mb-6 flex flex-col md:flex-row md:items-end gap-3 w-full animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex-1"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex-1"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex-1"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex-1"></div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex-1"></div>
    <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </div>
);

// Analytics Card Skeleton
export const AnalyticsCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100 animate-pulse">
    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </td>
    <td className="px-4 py-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-4 py-2">
      <div className="flex gap-2">
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </td>
  </tr>
);

// Knowledge Base Entry Skeleton
export const KnowledgeBaseEntrySkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-5/6"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
  </div>
);

// Profile Form Skeleton
export const ProfileFormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div>
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div>
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

// Generic Loading Spinner
export const LoadingSpinner = ({ size = "md", color = "primary" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const colorClasses = {
    primary: "border-primary-600",
    gray: "border-gray-600",
    white: "border-white"
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 ${sizeClasses[size]} ${colorClasses[color]} border-t-current`}></div>
  );
};

// Page Loading Skeleton
export const PageLoadingSkeleton = () => (
  <div className="modern-bg min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-slate-800 dark:backdrop-blur-none dark:border-slate-700 p-6 animate-pulse">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
); 