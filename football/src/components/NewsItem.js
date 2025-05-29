import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

const NewsItem = ({ title, description, imageUrl, newsUrl, publishedAt, source }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="news-card">
      <img 
        src={imageUrl} 
        alt={title} 
        className="news-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/640x360?text=News+Image+Unavailable';
        }}
      />
      <div className="news-content">
        <div>
          <h3 className="news-title">{title}</h3>
          <p className="news-description">{description}</p>
        </div>
        <div className="news-footer">
          <div className="news-meta">
            <span className="news-date">
              <Calendar size={16} />
              {formatDate(publishedAt)}
            </span>
            <span className="news-source">{source}</span>
          </div>
          <a 
            href={newsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="news-btn"
          >
            Read Full Article
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsItem;
