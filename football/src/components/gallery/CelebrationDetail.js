import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import celebrationsData from '../../data/football_celebrations.json';
import './CelebrationDetail.css';

const CelebrationDetail = () => {
  const { celebrationId } = useParams();
  const navigate = useNavigate();
  const [celebration, setCelebration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to find the celebration by matching the URL-friendly ID
    const foundCelebration = celebrationsData.find(cel => {
      // Clean the celebration name to match the format used in the URL
      const cleanCelebrationName = cel.celebration_name.toLowerCase()
        .replace(/[\/\\?%*:|"<>.,;=]/g, '')
        .replace(/\s+/g, '-');
        
      const celebrationUrlId = cel.player.toLowerCase().replace(/\s+/g, '-') + '-' + cleanCelebrationName;
      return celebrationUrlId === celebrationId;
    });
    
    if (foundCelebration) {
      setCelebration(foundCelebration);
    }
    setLoading(false);
  }, [celebrationId]);

  const handleGoBack = () => {
    navigate('/celebrations-gallery');
  };

  const handleDownload = () => {
    if (!celebration) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = celebration.image_url;
    link.download = `${celebration.player.toLowerCase().replace(/\s+/g, '-')}-${celebration.celebration_name.toLowerCase().replace(/[\/\\?%*:|"<>.,;=]/g, '').replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="celebration-detail-page">
        <div className="celebration-detail-loading">
          <div className="celebration-skeleton-loading"></div>
        </div>
      </div>
    );
  }

  if (!celebration) {
    return (
      <div className="celebration-detail-page">
        <div className="celebration-not-found">
          <button className="celebration-back-button" onClick={handleGoBack} aria-label="Go back to gallery">
            <ArrowLeft size={24} />
          </button>
          <h2>Celebration Not Found</h2>
          <p>Sorry, we couldn't find the celebration you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="celebration-detail-page">
      <button className="celebration-back-button" onClick={handleGoBack} aria-label="Go back to gallery">
        <ArrowLeft size={24} />
      </button>
      
      <div className="celebration-detail-content">
        <div className="celebration-detail-header">
          <div className="celebration-title-section">
            <h1>{celebration.celebration_name}</h1>
            {celebration.signature_move && (
              <div className="celebration-detail-badge">
                Signature Move
              </div>
            )}
          </div>
          
          <div className="celebration-meta-info">
            <div className="celebration-meta-player">
              <span className="meta-label">Player:</span>
              <span className="meta-value">{celebration.player}</span>
            </div>
            <div className="celebration-meta-nationality">
              <span className="meta-label">Nationality:</span>
              <span className="meta-value">{celebration.nationality}</span>
            </div>
          </div>
        </div>
        
        <div className="celebration-detail-image-container">
          <img 
            src={celebration.image_url} 
            alt={`${celebration.player} performing the ${celebration.celebration_name} celebration`}
            className="celebration-detail-image"
          />
          <button className="celebration-download-btn" onClick={handleDownload}>
            <Download size={18} />
            <span>Download Image</span>
          </button>
        </div>
        
        <div className="celebration-detail-info">
          <div className="celebration-stats">
            <div className="celebration-stat-item">
              <span className="celebration-stat-label">First Performed</span>
              <span className="celebration-stat-value">{celebration.first_performed}</span>
            </div>
            <div className="celebration-stat-item">
              <span className="celebration-stat-label">Event</span>
              <span className="celebration-stat-value celebration-event">{celebration.event}</span>
            </div>
          </div>
          
          <div className="celebration-description">
            <h3>About This Celebration</h3>
            <p>{celebration.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationDetail; 