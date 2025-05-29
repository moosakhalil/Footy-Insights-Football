import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Trophy, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import iconicMomentsData from '../../data/iconic_football_moments.json';
import './IconicMoments.css';

const IconicMoments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load moments data
  useEffect(() => {
    setMoments(iconicMomentsData);
    setLoading(false);
  }, []);

  // Filter moments based on search query and filter type
  const filteredMoments = moments.filter(moment => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return true;
    
    const title = moment.title.toLowerCase();
    const player = moment.player.toLowerCase();
    const team = moment.team.toLowerCase();
    const event = moment.event.toLowerCase();
    const year = moment.year.toString();
    
    switch(filterType) {
      case 'player':
        return player.includes(query);
      case 'team':
        return team.includes(query);
      case 'year':
        return year.includes(query);
      case 'event':
        return event.includes(query);
      default:
        return title.includes(query) || 
               player.includes(query) || 
               team.includes(query) || 
               event.includes(query) ||
               year.includes(query);
    }
  });

  // Handle moment selection
  const handleMomentClick = (moment) => {
    // Create URL-friendly title
    const momentId = moment.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/iconic-moment/${momentId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="iconic-moments-page">
    <div className="iconic-moments-container">
      <div className="moments-header">
          <h1><span className="white-text">FOOTY</span> INSIGHTS <span className="white-text">MOMENTS</span></h1>
        <p>Relive the most memorable moments in football history</p>
      </div>
      
      <div className="moments-search-container">
        <div className="moments-search-wrapper">
          <Search className="moments-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search moments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="moments-search-input"
          />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
        </div>
        
        <div className="moments-filter-options">
          <div className="moments-filter-buttons">
            <button 
              className={`moments-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button 
              className={`moments-filter-btn ${filterType === 'player' ? 'active' : ''}`}
              onClick={() => setFilterType('player')}
            >
                Players
            </button>
            <button 
              className={`moments-filter-btn ${filterType === 'team' ? 'active' : ''}`}
              onClick={() => setFilterType('team')}
            >
                Teams
            </button>
            <button 
              className={`moments-filter-btn ${filterType === 'year' ? 'active' : ''}`}
              onClick={() => setFilterType('year')}
            >
                Years
            </button>
            <button 
              className={`moments-filter-btn ${filterType === 'event' ? 'active' : ''}`}
              onClick={() => setFilterType('event')}
            >
                Events
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="moments-loading">
            <Loader size={30} className="animate-spin" />
            <p>Loading iconic moments...</p>
        </div>
      ) : filteredMoments.length === 0 ? (
        <div className="no-moments-found">
          <p>No iconic moments found matching your search criteria.</p>
        </div>
      ) : (
        <div className="moments-grid">
          {filteredMoments.map((moment, index) => (
            <div 
              className="moment-card"
              key={index}
              onClick={() => handleMomentClick(moment)}
            >
              <div className="moment-image">
                <img 
                  src={moment.image_url} 
                  alt={moment.title}
                  loading="lazy"
                />
                <div className="moment-year">
                  <Calendar size={14} />
                  <span>{moment.year}</span>
                </div>
              </div>
              <div className="moment-info">
                <h3>{moment.title}</h3>
                <div className="moment-meta">
                  <div className="meta-item">
                    <User size={14} />
                    <span>{moment.player}</span>
                  </div>
                  <div className="meta-item">
                    <Trophy size={14} />
                    <span>{moment.event}</span>
                  </div>
                </div>
                <p className="moment-teams">
                  {moment.team} vs {moment.opponent}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default IconicMoments; 