import React, { useState, useEffect } from 'react';
import './LiveScores.css';
import { RefreshCw, Users, BarChart2, Search, X } from 'lucide-react';
import LineupView from './LineupView';
import MatchStatistics from './MatchStatistics';

const LiveScores = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewingLineups, setViewingLineups] = useState(false);
  const [viewingStats, setViewingStats] = useState(false);
  const [teamLogos, setTeamLogos] = useState({});
  const [logoLoading, setLogoLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all'); // 'all', 'team', or 'league'

  // Use a single API key for consistency
  const API_KEY = ' 3c52931893msh29061bfbbd02f7bp111042jsne9fc1ee372ae ';
  const API_HOST = 'allsportsapi2.p.rapidapi.com';

  const fetchLiveScores = async () => {
    setLoading(true);
    const url = 'https://allsportsapi2.p.rapidapi.com/api/matches/live';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const result = await response.json();
      const matchesData = result.events || [];
      setMatches(matchesData);
      setFilteredMatches(matchesData); // Initialize filtered matches with all matches
      setLastUpdated(new Date());
      setError(null);
      
      // Only fetch team logos if we have matches
      if (matchesData.length > 0) {
        fetchTeamLogos(matchesData);
      }
    } catch (error) {
      console.error('Error fetching live scores:', error);
      setError('Failed to fetch live scores. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamLogos = async (matchesData) => {
    setLogoLoading(true);
    
    // Create a list of unique team IDs and track existing logos
    const teamIds = new Set();
    matchesData.forEach(match => {
      if (match.homeTeam?.id && !teamLogos[match.homeTeam.id]) {
        teamIds.add(match.homeTeam.id);
      }
      if (match.awayTeam?.id && !teamLogos[match.awayTeam.id]) {
        teamIds.add(match.awayTeam.id);
      }
    });

    // If no new logos to fetch, exit early
    if (teamIds.size === 0) {
      setLogoLoading(false);
      return;
    }

    console.log(`Fetching logos for ${teamIds.size} teams`);
    
    // Use a more reliable approach with sequential fetching
    const newTeamLogos = { ...teamLogos };
    
    for (const teamId of teamIds) {
      try {
        const url = `https://allsportsapi2.p.rapidapi.com/api/team/${teamId}/image`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
          }
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          console.warn(`Could not fetch logo for team ${teamId}: ${response.status}`);
          createFallbackLogo(teamId, matchesData, newTeamLogos);
          continue;
        }
        
        // Try to get the image as a blob first
        try {
          const imageBlob = await response.blob();
          if (imageBlob.size > 0) {
            const logoUrl = URL.createObjectURL(imageBlob);
            newTeamLogos[teamId] = { type: 'blob', data: logoUrl };
          } else {
            createFallbackLogo(teamId, matchesData, newTeamLogos);
          }
        } catch (blobError) {
          console.warn(`Failed to process image as blob for team ${teamId}`);
          
          // Try JSON approach if blob fails
          try {
            // We need to fetch again since we consumed the response
            const jsonResponse = await fetch(url, options);
            const logoData = await jsonResponse.json();
            
            if (logoData.url) {
              newTeamLogos[teamId] = { type: 'url', data: logoData.url };
            } else if (logoData.base64) {
              newTeamLogos[teamId] = { type: 'base64', data: logoData.base64 };
            } else {
              createFallbackLogo(teamId, matchesData, newTeamLogos);
            }
          } catch (jsonError) {
            console.warn(`Failed to process response as JSON for team ${teamId}`);
            createFallbackLogo(teamId, matchesData, newTeamLogos);
          }
        }
      } catch (error) {
        console.error(`Error fetching logo for team ${teamId}:`, error);
        createFallbackLogo(teamId, matchesData, newTeamLogos);
      }
      
      // Update logos incrementally to improve UX
      if (Object.keys(newTeamLogos).length % 5 === 0 || 
          Array.from(teamIds).indexOf(teamId) === Array.from(teamIds).length - 1) {
        setTeamLogos({ ...newTeamLogos });
      }
    }
    
    // Final update of all logos
    setTeamLogos(newTeamLogos);
    setLogoLoading(false);
  };

  // Helper function to create fallback logo
  const createFallbackLogo = (teamId, matchesData, logoStore) => {
    const matchWithTeam = matchesData.find(match => 
      match.homeTeam?.id === teamId || match.awayTeam?.id === teamId
    );
    const teamName = matchWithTeam?.homeTeam?.id === teamId 
      ? matchWithTeam.homeTeam.name 
      : matchWithTeam?.awayTeam?.name;
    
    logoStore[teamId] = { 
      type: 'fallback', 
      data: teamName ? teamName.charAt(0).toUpperCase() : '?'
    };
  };

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterMatches(query, searchCategory);
  };

  const handleCategoryChange = (category) => {
    setSearchCategory(category);
    filterMatches(searchQuery, category);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredMatches(matches);
  };

  const filterMatches = (query, category) => {
    if (!query.trim()) {
      setFilteredMatches(matches);
      return;
    }

    const lowerCaseQuery = query.toLowerCase().trim();
    let filtered;

    switch (category) {
      case 'team':
        filtered = matches.filter(match => {
          const homeTeamName = match.homeTeam?.name?.toLowerCase() || '';
          const awayTeamName = match.awayTeam?.name?.toLowerCase() || '';
          return homeTeamName.includes(lowerCaseQuery) || awayTeamName.includes(lowerCaseQuery);
        });
        break;
      case 'league':
        filtered = matches.filter(match => {
          const tournamentName = match.tournament?.uniqueTournament?.name?.toLowerCase() || 
                             match.tournament?.name?.toLowerCase() || '';
          return tournamentName.includes(lowerCaseQuery);
        });
        break;
      default: // 'all'
        filtered = matches.filter(match => {
          const homeTeamName = match.homeTeam?.name?.toLowerCase() || '';
          const awayTeamName = match.awayTeam?.name?.toLowerCase() || '';
          const tournamentName = match.tournament?.uniqueTournament?.name?.toLowerCase() || 
                             match.tournament?.name?.toLowerCase() || '';
          return homeTeamName.includes(lowerCaseQuery) || 
                 awayTeamName.includes(lowerCaseQuery) || 
                 tournamentName.includes(lowerCaseQuery);
        });
    }

    setFilteredMatches(filtered);
  };

  useEffect(() => {
    fetchLiveScores();
    
    // Set up auto-refresh every 60 seconds, but only if not viewing lineups or stats
    const intervalId = setInterval(() => {
      if (!viewingLineups && !viewingStats) {
        fetchLiveScores();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [viewingLineups, viewingStats]);

  // Re-filter matches when the original matches array changes (e.g., after refresh)
  useEffect(() => {
    filterMatches(searchQuery, searchCategory);
  }, [matches]);

  const formatTime = (time) => {
    if (!time) return '';
    const minutes = Math.floor(time / 60);
    return `${minutes}'`;
  };

  const getMatchStatus = (status) => {
    if (!status) return 'Unknown';
    
    switch (status.description) {
      case '1st half':
        return 'First Half';
      case '2nd half':
        return 'Second Half';
      case 'Halftime':
        return 'Half-Time';
      case 'Ended':
        return 'Finished';
      default:
        return status.description || 'Live';
    }
  };

  const handleLineupClick = (match) => {
    setSelectedMatch(match);
    setViewingLineups(true);
    setViewingStats(false);
  };

  const handleStatsClick = (match) => {
    setSelectedMatch(match);
    setViewingStats(true);
    setViewingLineups(false);
  };

  const handleBackFromLineups = () => {
    setViewingLineups(false);
    setSelectedMatch(null);
  };

  const handleBackFromStats = () => {
    setViewingStats(false);
    setSelectedMatch(null);
  };

  // Enhanced team logo renderer with better fallbacks
  const renderTeamLogo = (teamId, teamName) => {
    const logoData = teamLogos[teamId];
    
    if (!logoData) {
      // Show loading state if logos are being fetched
      return (
        <div className="team-logo-placeholder">
          {logoLoading ? (
            <div className="logo-loading"></div>
          ) : (
            <div className="team-logo-text">
              {teamName ? teamName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>
      );
    }
    
    switch (logoData.type) {
      case 'url':
        return (
          <div className="team-logo-container">
            <img 
              src={logoData.data}
              alt={`${teamName} logo`}
              className="team-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                // Show team initial as fallback
                const fallback = document.createElement('div');
                fallback.className = 'team-logo-text';
                fallback.textContent = teamName ? teamName.charAt(0).toUpperCase() : '?';
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
        );
      case 'base64':
        return (
          <div className="team-logo-container">
            <img 
              src={`data:image/png;base64,${logoData.data}`}
              alt={`${teamName} logo`}
              className="team-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                // Show team initial as fallback
                const fallback = document.createElement('div');
                fallback.className = 'team-logo-text';
                fallback.textContent = teamName ? teamName.charAt(0).toUpperCase() : '?';
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
        );
      case 'blob':
        return (
          <div className="team-logo-container">
            <img 
              src={logoData.data}
              alt={`${teamName} logo`}
              className="team-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                // Show team initial as fallback
                const fallback = document.createElement('div');
                fallback.className = 'team-logo-text';
                fallback.textContent = teamName ? teamName.charAt(0).toUpperCase() : '?';
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
        );
      case 'fallback':
        return (
          <div className="team-logo-container">
            <div className="team-logo-text">
              {logoData.data}
            </div>
          </div>
        );
      default:
        return (
          <div className="team-logo-placeholder">
            <div className="team-logo-text">
              {teamName ? teamName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        );
    }
  };

  // If viewing lineups, render the LineupView component
  if (viewingLineups && selectedMatch) {
    return (
      <LineupView 
        matchId={selectedMatch.id} 
        match={selectedMatch} 
        onBack={handleBackFromLineups} 
        teamLogos={teamLogos}
      />
    );
  }

  // If viewing statistics, render the MatchStatistics component
  if (viewingStats && selectedMatch) {
    return (
      <MatchStatistics
        matchId={selectedMatch.id}
        match={selectedMatch}
        onBack={handleBackFromStats}
        teamLogos={teamLogos}
      />
    );
  }

  if (loading && !matches.length) {
    return (
      <div className="live-scores-container">
        <div className="live-scores-header">
          <div className="header-content">
            <h1>Live Scores</h1>
          </div>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading live matches...</span>
        </div>
      </div>
    );
  }

  if (error && !matches.length) {
    return (
      <div className="live-scores-container">
        <div className="live-scores-header">
          <div className="header-content">
            <h1>Live Scores</h1>
          </div>
        </div>
        <div className="error">
          <p>{error}</p>
          <button className="refresh-button" onClick={fetchLiveScores}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="live-scores-container">
      <div className="live-scores-header">
        <div className="header-content">
          <h1>Live Scores</h1>
        </div>
      </div>
      
      {/* Search Component */}
      <div className="livescore-search-container">
        <div className="livescore-search-wrapper">
          <div className="livescore-search-input-container">
            <Search size={18} className="livescore-search-icon" />
            <input
              type="text"
              className="livescore-search-input"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="livescore-search-clear-button" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="livescore-search-filter">
            <button 
              className={`livescore-filter-button ${searchCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All
            </button>
            <button 
              className={`livescore-filter-button ${searchCategory === 'team' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('team')}
            >
              Teams
            </button>
            <button 
              className={`livescore-filter-button ${searchCategory === 'league' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('league')}
            >
              Leagues
            </button>
          </div>
        </div>
      </div>
      
      <div className="match-count">
        Showing {filteredMatches.length} {searchQuery ? 'matching' : 'live'} matches
        {logoLoading && <span className="logo-loading-indicator"> (Loading team logos...)</span>}
      </div>
      
      <div className="matches-grid">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div className="match-card" key={match.id}>
              <div className="match-header">
                <div className="league-info">
                  <div className="livescore-league-name">
                    {match.tournament?.uniqueTournament?.name || match.tournament?.name || 'Unknown League'}
                  </div>
                  <div className="match-status">
                    {getMatchStatus(match.status)} {formatTime(match.time?.initial)}
                  </div>
                </div>
                <div className="match-actions">
                  <button 
                    className="lineup-button"
                    onClick={() => handleLineupClick(match)}
                  >
                    <Users size={16} /> Lineup
                  </button>
                  <button 
                    className="stats-button"
                    onClick={() => handleStatsClick(match)}
                  >
                    <BarChart2 size={16} /> Stats
                  </button>
                </div>
              </div>
              
              <div className="match-content">
                <div className="team">
                  {match.homeTeam?.id && renderTeamLogo(match.homeTeam.id, match.homeTeam.name)}
                  <div className="team-name">{match.homeTeam?.name || 'Home Team'}</div>
                  <div className="score">{match.homeScore?.current || 0}</div>
                </div>
                
                <div className="match-separator">vs</div>
                
                <div className="team">
                  {match.awayTeam?.id && renderTeamLogo(match.awayTeam.id, match.awayTeam.name)}
                  <div className="team-name">{match.awayTeam?.name || 'Away Team'}</div>
                  <div className="score">{match.awayScore?.current || 0}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="livescore-no-results">
            {searchQuery ? (
              <>
                <span>No matches found for "{searchQuery}"</span>
                <p>Try a different search term or category</p>
                <button className="livescore-clear-search-btn" onClick={clearSearch}>
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <span>No live matches available</span>
                <p>Check back later for live matches</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {filteredMatches.length > 0 && (
        <>
          <button 
            className="refresh-button" 
            onClick={fetchLiveScores}
          >
            <RefreshCw size={18} /> Refresh Scores
          </button>
          
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </>
      )}
      
      {matches.length === 0 && !loading && !error && (
        <div className="no-matches">
          <p>No live matches available at the moment</p>
          <button 
            className="refresh-button" 
            onClick={fetchLiveScores}
          >
            <RefreshCw size={18} /> Check for Matches
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveScores;