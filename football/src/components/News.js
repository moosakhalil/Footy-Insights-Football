import React, { useState, useEffect } from 'react';
import NewsItem from './NewsItem';
import './News.css';
import { Loader } from 'lucide-react';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const url = "https://newsapi.org/v2/everything?q=soccer&language=en&sortBy=publishedAt&pageSize=100&apiKey=bf7de468c90b4b25a33243ab2d796ed9";
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        
        // Filter out articles without required data
        const validArticles = data.articles.filter(article => 
          article.title && 
          article.description && 
          article.urlToImage &&
          !article.title.includes('[Removed]') // Filter out removed articles
        );
        
        setArticles(validArticles.slice(0, 24)); // Show top 24 articles
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (error) {
    return (
      <div className="news-container">
        <div className="news-header">
          <h1 className="news-heading">
            <span>FOOTY </span>
            <span className="news-heading-highlight">INSIGHTS </span>
            <span>NEWS</span>
          </h1>
        </div>
        <div className="news-error">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="news-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-header">
        <h1 className="news-heading">
          <span>FOOTY </span>
          <span className="news-heading-highlight">INSIGHTS </span>
          <span>NEWS</span>
        </h1>
      </div>

      {loading ? (
        <div className="loading-text">
          <Loader size={30} className="animate-spin" />
          <p>Loading latest football news...</p>
        </div>
      ) : (
        <div className="news-grid">
          {articles.map((article, index) => (
            <NewsItem
              key={`${article.url}-${index}`}
              title={article.title}
              description={article.description}
              imageUrl={article.urlToImage}
              newsUrl={article.url}
              publishedAt={article.publishedAt}
              source={article.source.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
