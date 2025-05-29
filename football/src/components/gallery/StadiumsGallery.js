import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader } from 'lucide-react';
import stadiumsData from '../../data/stadiums_data.json';
import './StadiumsGallery.css';

const StadiumsGallery = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load stadiums data
  useEffect(() => {
    setStadiums(stadiumsData);
    setLoading(false);
  }, []);

  // Filter stadiums based on search query and filter type
  const filteredStadiums = stadiums.filter(stadium => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return true;
    
    const team = typeof stadium.team === 'string' 
      ? stadium.team.toLowerCase() 
      : Object.keys(stadium.team).join(' ').toLowerCase();
    
    const location = stadium.location.toLowerCase();
    const stadiumName = stadium.stadium_name.toLowerCase();
    
    // Get country from location (usually the last part after the comma)
    const country = location.split(',').pop().trim();
    
    switch(filterType) {
      case 'team':
        return team.includes(query);
      case 'stadium':
        return stadiumName.includes(query);
      case 'country':
        return country.includes(query);
      default:
        return team.includes(query) || 
               stadiumName.includes(query) || 
               country.includes(query);
    }
  });

  // Handle stadium selection
  const handleStadiumClick = (stadium) => {
    // Convert stadium name to URL-friendly format
    const stadiumId = stadium.stadium_name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/stadium/${stadiumId}`);
  };

  // Render team logo
  const renderTeamLogo = (stadium) => {
    if (!stadium.team_logo) return null;
    
    if (typeof stadium.team_logo === 'string') {
      return (
        <div className="stadium-team-logo">
          <img src={stadium.team_logo} alt={`${stadium.team} logo`} />
        </div>
      );
    } else {
      // If there are multiple teams, show the first team's logo
      const firstTeam = Object.keys(stadium.team_logo)[0];
      return (
        <div className="stadium-team-logo">
          <img src={stadium.team_logo[firstTeam]} alt={`${firstTeam} logo`} />
        </div>
      );
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  if (loading) {
    return (
      <div className="stadiums-container">
        <div className="stadiums-header">
          <h1 className="stadiums-heading">
            <span>FOOTY </span>
            <span className="stadiums-heading-highlight">INSIGHTS </span>
            <span>STADIUMS</span>
          </h1>
        </div>
        <div className="loading-text">
          <Loader size={30} className="animate-spin" />
          <p>Loading stadium information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stadiums-container">
      <div className="stadiums-header">
        <h1 className="stadiums-heading">
          <span>FOOTY </span>
          <span className="stadiums-heading-highlight">INSIGHTS </span>
          <span>STADIUMS</span>
        </h1>
      </div>
      
      <div className="stadiums-search-container">
        <div className="stadiums-search-wrapper">
          <div className="stadiums-search-input-container">
            <Search size={18} className="stadiums-search-icon" />
          <input
            type="text"
              className="stadiums-search-input"
            placeholder="Search stadiums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
            {searchQuery && (
              <button className="stadiums-search-clear-button" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
        </div>
        
          <div className="stadiums-search-filter">
            <button 
              className={`stadiums-filter-button ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button 
              className={`stadiums-filter-button ${filterType === 'team' ? 'active' : ''}`}
              onClick={() => setFilterType('team')}
            >
              Teams
            </button>
            <button 
              className={`stadiums-filter-button ${filterType === 'stadium' ? 'active' : ''}`}
              onClick={() => setFilterType('stadium')}
            >
              Stadiums
            </button>
            <button 
              className={`stadiums-filter-button ${filterType === 'country' ? 'active' : ''}`}
              onClick={() => setFilterType('country')}
            >
              Countries
            </button>
          </div>
        </div>
      </div>
      
      {filteredStadiums.length === 0 ? (
        <div className="no-stadiums-found">
          <p>No stadiums found matching your search criteria.</p>
          <button onClick={clearSearch} className="stadiums-btn">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="stadiums-grid">
          {filteredStadiums.map((stadium, index) => (
            <div 
              key={index}
              className="stadium-card"
              onClick={() => handleStadiumClick(stadium)}
            >
                <img 
                  src={stadium.images[0]} 
                  alt={stadium.stadium_name}
                className="stadium-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/640x360?text=Stadium+Image+Unavailable';
                }}
              />
              <div className="stadium-content">
                <div>
                  <h3 className="stadium-title">{stadium.stadium_name}</h3>
                  <p className="stadium-description">{stadium.description.substring(0, 150)}...</p>
              </div>
                <div className="stadium-footer">
                  <div className="stadium-meta">
                    <span className="stadium-location">
                      {stadium.location}
                    </span>
                    <span className="stadium-team-name">
                  {typeof stadium.team === 'string' 
                    ? stadium.team 
                    : Object.keys(stadium.team).join(' & ')}
                    </span>
                  </div>
                  <button className="stadium-btn">
                    View Details
                  </button>
                </div>
              </div>
              {renderTeamLogo(stadium)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StadiumsGallery; 