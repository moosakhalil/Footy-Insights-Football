import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import celebrationsData from '../../data/football_celebrations.json';
import './CelebrationsGallery.css';

const CelebrationsGallery = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [celebrations, setCelebrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load celebrations data
  useEffect(() => {
    setCelebrations(celebrationsData);
    setLoading(false);
  }, []);

  // Filter celebrations based on search query and filter type
  const filteredCelebrations = celebrations.filter(celebration => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return true;
    
    const player = celebration.player.toLowerCase();
    const nationality = celebration.nationality.toLowerCase();
    const celebrationName = celebration.celebration_name.toLowerCase();
    
    switch(filterType) {
      case 'player':
        return player.includes(query);
      case 'celebration':
        return celebrationName.includes(query);
      case 'nationality':
        return nationality.includes(query);
      default:
        return player.includes(query) || 
               celebrationName.includes(query) || 
               nationality.includes(query);
    }
  });

  // Handle celebration selection
  const handleCelebrationClick = (celebration) => {
    // Convert celebration name to URL-friendly format
    // Remove any special characters and replace with hyphens
    const cleanCelebrationName = celebration.celebration_name.toLowerCase()
      .replace(/[\/\\?%*:|"<>.,;=]/g, '')
      .replace(/\s+/g, '-');
      
    const celebrationId = celebration.player.toLowerCase().replace(/\s+/g, '-') + '-' + cleanCelebrationName;
    navigate(`/celebration/${celebrationId}`);
  };

  // Get unique nationalities for filter options
  const nationalities = [...new Set(
    celebrations.map(celebration => celebration.nationality)
  )].sort();

  return (
    <div className="celebrations-gallery-container">
      <div className="celebrations-header">
        <h1>
          FAMOUS <span className="gradient-text">GOAL</span> CELEBRATIONS
        </h1>
        <p>Explore the most iconic goal celebrations in football history</p>
      </div>
      
      <div className="celebrations-search-container">
        <div className="celebrations-search-wrapper">
          <Search className="celebrations-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search celebrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="celebrations-search-input"
          />
        </div>
        
        <div className="celebrations-filter-options">
          <label className="celebrations-filter-label">Filter by:</label>
          <div className="celebrations-filter-buttons">
            <button 
              className={`celebrations-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button 
              className={`celebrations-filter-btn ${filterType === 'player' ? 'active' : ''}`}
              onClick={() => setFilterType('player')}
            >
              Player
            </button>
            <button 
              className={`celebrations-filter-btn ${filterType === 'celebration' ? 'active' : ''}`}
              onClick={() => setFilterType('celebration')}
            >
              Celebration
            </button>
            <button 
              className={`celebrations-filter-btn ${filterType === 'nationality' ? 'active' : ''}`}
              onClick={() => setFilterType('nationality')}
            >
              Nationality
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="celebrations-loading">
          <Loader size={30} className="animate-spin" />
          <p>Loading celebrations...</p>
        </div>
      ) : filteredCelebrations.length === 0 ? (
        <div className="celebrations-not-found">
          <p>No celebrations found matching your search criteria.</p>
        </div>
      ) : (
        <div className="celebrations-grid">
          {filteredCelebrations.map((celebration, index) => (
            <div 
              className="celebration-card"
              key={index}
              onClick={() => handleCelebrationClick(celebration)}
            >
              <div className="celebration-image">
                <img 
                  src={celebration.image_url} 
                  alt={celebration.celebration_name}
                  loading="lazy"
                />
                {celebration.signature_move && (
                  <div className="celebration-signature-badge">
                    Signature
                  </div>
                )}
              </div>
              <div className="celebration-info">
                <h3>{celebration.celebration_name}</h3>
                <p className="celebration-player">{celebration.player}</p>
                <p className="celebration-nationality">{celebration.nationality}</p>
                <button className="celebration-details-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CelebrationsGallery; 