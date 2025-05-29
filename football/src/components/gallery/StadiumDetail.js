import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Loader } from 'lucide-react';
import stadiumsData from '../../data/stadiums_data.json';
import StadiumSlider from './StadiumSlider';
import './StadiumDetail.css';

const StadiumDetail = () => {
  const { stadiumId } = useParams();
  const navigate = useNavigate();
  const [stadium, setStadium] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the stadium by its URL-friendly name
    const foundStadium = stadiumsData.find(
      stadium => stadium.stadium_name.toLowerCase().replace(/\s+/g, '-') === stadiumId
    );
    
    if (foundStadium) {
      setStadium(foundStadium);
    }
    setLoading(false);
  }, [stadiumId]);

  const handleGoBack = () => {
    navigate('/stadiums-gallery');
  };

  // Render team logo
  const renderTeamLogo = () => {
    if (!stadium || !stadium.team_logo) return null;
    
    if (typeof stadium.team_logo === 'string') {
      return (
        <div className="stadium-detail-team-logo">
          <img src={stadium.team_logo} alt={`${stadium.team} logo`} />
        </div>
      );
    } else {
      // For multiple teams, show logos with team names
      return (
        <div className="stadium-detail-team-logos">
          {Object.entries(stadium.team_logo).map(([team, logo], index) => (
            <div className="team-logo-item" key={index}>
              <img src={logo} alt={`${team} logo`} />
              <span className="team-name">{team}</span>
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="stadium-detail-page">
        <div className="loading-text">
          <Loader size={30} className="animate-spin" />
          <p>Loading stadium details...</p>
        </div>
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="stadium-detail-page">
        <div className="stadium-not-found">
          <button className="back-button" onClick={handleGoBack} aria-label="Go back to gallery">
            <ArrowLeft size={24} />
          </button>
          <h2>Stadium Not Found</h2>
          <p>Sorry, we couldn't find the stadium you're looking for.</p>
          <button onClick={handleGoBack} className="stadium-btn">
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stadium-detail-page">
      <button className="back-button" onClick={handleGoBack} aria-label="Go back to gallery">
        <ArrowLeft size={24} />
      </button>
      
      <div className="stadium-detail-content">
        <div className="stadium-detail-header">
          <div className="stadium-title-section">
            <h1 className="stadium-detail-heading">
              <span>{stadium.stadium_name}</span>
            </h1>
            {renderTeamLogo()}
          </div>
          <div className="stadium-detail-meta">
            <span className="meta-item">
              <MapPin size={16} />
              {stadium.location}
            </span>
            <span className="meta-item">
              <Users size={16} />
              {typeof stadium.team === 'string' 
                ? stadium.team 
                : Object.keys(stadium.team).join(' & ')}
            </span>
            <span className="meta-item">
              <Calendar size={16} />
              Opened: {stadium.opened}
            </span>
          </div>
        </div>
        
        <StadiumSlider 
          images={stadium.images} 
          stadiumName={stadium.stadium_name}
        />
        
        <div className="stadium-detail-info">
          <div className="stadium-stats">
            <div className="stat-item">
              <span className="stat-label">Capacity</span>
              <span className="stat-value">{stadium.capacity.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Opened</span>
              <span className="stat-value">{stadium.opened}</span>
            </div>
            {stadium.renovation && (
              <div className="stat-item">
                <span className="stat-label">Last Renovation</span>
                <span className="stat-value">{stadium.renovation}</span>
              </div>
            )}
          </div>
          
          <div className="stadium-description-section">
            <h2>About {stadium.stadium_name}</h2>
            <p>{stadium.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumDetail; 