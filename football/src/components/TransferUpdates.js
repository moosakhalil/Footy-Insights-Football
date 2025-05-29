import React, { useState, useEffect } from 'react';
import './TransferUpdates.css';
import { Calendar, Tag } from 'lucide-react';

const TransferUpdates = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      const url = 'https://football_api12.p.rapidapi.com/players/transfers';
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'f57a1107c5msh9ffc70ba1880f52p177f1djsne01418d1e559',
          'x-rapidapi-host': 'football_api12.p.rapidapi.com'
        }
      };

      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Failed to fetch transfer updates');
        }
        const data = await response.json();
        setTransfers(data);
      } catch (error) {
        console.error('Error fetching transfers:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const getSourceColor = (source) => {
    switch (source.toLowerCase()) {
      case 'mirror':
        return '#FF0000';
      case 'skysports':
        return '#0072E5';
      default:
        return '#60a5fa';
    }
  };

  if (loading) {
    return (
      <div className="transfers-container">
        <div className="loading-text">
          <div className="loading-spinner"></div>
          <p>Loading transfer updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transfers-container">
        <div className="transfers-error">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transfers-container">
      <div className="transfers-header">
        <h1 className="transfers-heading">
          TRANSFER <span className="transfers-heading-highlight">INSIGHTS</span>
        </h1>
      </div>
      
      <div className="transfers-grid">
        {transfers.map((transfer) => (
          <a 
            key={transfer.id} 
            href={transfer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transfer-card"
          >
            <div className="transfer-content">
              <div className="transfer-meta">
                <div className="transfer-date">
                  <Calendar size={14} />
                  {new Date().toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div 
                  className="transfer-source"
                  style={{ color: getSourceColor(transfer.source) }}
                >
                  <Tag size={14} />
                  {transfer.source}
                </div>
              </div>
              <h3 className="transfer-title">{transfer.title}</h3>
              <div className="transfer-footer">
                <div className="transfer-btn">
                  READ MORE
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TransferUpdates; 