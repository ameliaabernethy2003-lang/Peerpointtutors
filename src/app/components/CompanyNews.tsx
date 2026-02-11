'use client';

import { useState, useEffect } from 'react';

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  description: string;
  source: string;
}

interface CompanyNewsProps {
  company: Company;
}

export default function CompanyNews({ company }: CompanyNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/company-news?company=${encodeURIComponent(company.name)}&ticker=${encodeURIComponent(company.ticker)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch news');
        }

        // API returns array directly, not wrapped in articles property
        setArticles(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load company news');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    if (company) {
      fetchNews();
    }
  }, [company]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Company News</h2>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Loading news...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <p className="font-semibold mb-1">Unable to load news</p>
          <p>{error}</p>
          <p className="mt-2 text-xs">
            News is fetched from Yahoo Finance RSS feeds. A valid ticker symbol is required.
          </p>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No recent news articles found for {company.name}.</p>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm leading-tight block mb-1 hover:underline"
                  >
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                  title="Open in new tab"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

