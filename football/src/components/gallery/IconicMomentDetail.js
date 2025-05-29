import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Trophy, Download, Loader } from 'lucide-react';
import iconicMomentsData from '../../data/iconic_football_moments.json';
import './IconicMomentDetail.css';

const IconicMomentDetail = () => {
  const { momentId } = useParams();
  const navigate = useNavigate();
  const [moment, setMoment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the moment by its URL-friendly title
    const foundMoment = iconicMomentsData.find(
      moment => moment.title.toLowerCase().replace(/\s+/g, '-') === momentId
    );
    
    if (foundMoment) {
      setMoment(foundMoment);
    }
    setLoading(false);
  }, [momentId]);

  const handleGoBack = () => {
    navigate('/iconic-moments');
  };

  const handleDownload = () => {
    if (!moment) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = moment.image_url;
    link.download = `${moment.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="moment-detail-page">
        <div className="loading-text">
          <Loader size={30} className="animate-spin" />
          <p>Loading moment details...</p>
        </div>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="moment-detail-page">
        <div className="moment-not-found">
          <button className="back-button" onClick={handleGoBack} aria-label="Go back to iconic moments">
            <ArrowLeft size={24} />
          </button>
          <h2>Moment Not Found</h2>
          <p>Sorry, we couldn't find the iconic moment you're looking for.</p>
          <button onClick={handleGoBack} className="return-btn">
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="moment-detail-page">
      <button className="back-button" onClick={handleGoBack} aria-label="Go back to iconic moments">
        <ArrowLeft size={24} />
      </button>
      
      <div className="moment-detail-content">
        <div className="moment-detail-header">
          <div className="moment-title-section">
            <h1>{moment.title}</h1>
            <div className="moment-year-badge">
              <Calendar size={18} />
              <span>{moment.year}</span>
            </div>
          </div>
          
          <div className="moment-meta">
            <div className="meta-item">
              <User size={16} />
              <span className="meta-label">Player:</span>
              <span className="meta-value">{moment.player}</span>
            </div>
            <div className="meta-item">
              <Trophy size={16} />
              <span className="meta-label">Event:</span>
              <span className="meta-value">{moment.event}</span>
            </div>
          </div>
          
          <div className="moment-teams">
            <span>{moment.team}</span>
            <span className="vs">vs</span>
            <span>{moment.opponent}</span>
          </div>
        </div>
        
        <div className="moment-detail-image">
          <img src={moment.image_url} alt={moment.title} />
          <button className="download-btn" onClick={handleDownload}>
            <Download size={18} />
            <span>Download Image</span>
          </button>
        </div>
        
        <div className="moment-description">
          <h3>The Story</h3>
          <p>{moment.description}</p>
        </div>
        
        {moment.additional_info && (
          <div className="moment-additional-info">
            <h3>Additional Details</h3>
            <p>{moment.additional_info}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconicMomentDetail; 