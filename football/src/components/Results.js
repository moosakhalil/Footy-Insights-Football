import React, { useState, useEffect } from 'react';
import { Shield, Search, X } from 'lucide-react';
import './Results.css';
import { useTheme } from '../context/ThemeContext';

// Pakistan is UTC+5
const PAKISTAN_TIME_OFFSET = 5 * 60 * 60 * 1000;

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all'); // 'all', 'team', or 'league'
  const { theme } = useTheme();
  // Centralized state for team logos
  const [teamLogos, setTeamLogos] = useState({});
  const [logoLoading, setLogoLoading] = useState(false);
  // Track image load errors
  const [imageErrors, setImageErrors] = useState({});

  // API key for consistency
  const API_KEY = '593ae17a30msha9ad81db8305048p1f1c99jsn2c6c7b2d5637';
  const API_HOST = 'allsportsapi2.p.rapidapi.com';

  // Apply theme to document element for component-specific styling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getFormattedDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  };

  const convertToPakistanTime = (timestamp) => {
    const utcTime = new Date(timestamp);
    // Get the UTC time in milliseconds
    const utcMillis = utcTime.getTime();
    // Convert to Pakistan time by adding the offset
    const pktMillis = utcMillis + PAKISTAN_TIME_OFFSET;
    return new Date(pktMillis);
  };

  const formatPakistanTime = (date) => {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    // Simplify the time format, just showing hours and minutes
    return `${hours}:${minutes}`;
  };

  // Helper function to create fallback logo
  const createFallbackLogo = (teamId, resultsData, logoStore) => {
    const resultWithTeam = resultsData.find(match => 
      match.homeTeam?.id === teamId || match.awayTeam?.id === teamId
    );
    const teamName = resultWithTeam?.homeTeam?.id === teamId 
      ? resultWithTeam.homeTeam.name 
      : resultWithTeam?.awayTeam?.name;
    
    logoStore[teamId] = { 
      type: 'fallback', 
      data: teamName ? teamName.charAt(0).toUpperCase() : '?'
    };
  };

  // Function to fetch team logos
  const fetchTeamLogos = async (resultsData) => {
    setLogoLoading(true);
    
    // Create a list of unique team IDs and track existing logos
    const teamIds = new Set();
    resultsData.forEach(match => {
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
    
    // Use a more reliable approach with sequential fetching
    const newTeamLogos = { ...teamLogos };
    
    for (const teamId of teamIds) {
      try {
        const url = `https://allsportsapi2.p.rapidapi.com/api/team/${teamId}/image`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '24e7cf81b8mshce0c8b85cf4b07ap138c5fjsneb6b7fd0637f',
            'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com'
          }
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          console.warn(`Could not fetch logo for team ${teamId}: ${response.status}`);
          createFallbackLogo(teamId, resultsData, newTeamLogos);
          continue;
        }
        
        // Try to get the image as a blob
        try {
          const imageBlob = await response.blob();
          if (imageBlob.size > 0) {
            const logoUrl = URL.createObjectURL(imageBlob);
            newTeamLogos[teamId] = { type: 'blob', data: logoUrl };
          } else {
            createFallbackLogo(teamId, resultsData, newTeamLogos);
          }
        } catch (blobError) {
          console.warn(`Failed to process image as blob for team ${teamId}`);
          createFallbackLogo(teamId, resultsData, newTeamLogos);
        }
      } catch (error) {
        console.error(`Error fetching logo for team ${teamId}:`, error);
        createFallbackLogo(teamId, resultsData, newTeamLogos);
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

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const today = new Date();
        const formattedDate = getFormattedDate(today);
        
        const url = `https://allsportsapi2.p.rapidapi.com/api/matches/${formattedDate}`;
        
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '2aed715726msh246888ec46b9077p1e6798jsndd24f623590e',
            'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com'
          }
        };

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
          const processedResults = data.events
            .filter(match => {
              const isFinished = match.status?.type === 'FINISHED' || 
                             match.status?.description === 'Ended' ||
                             match.status?.description === 'Finished';
              
              return isFinished;
            })
            .map(match => ({
              id: match.id || '',
              league: {
                name: match.tournament?.name || 'Unknown League',
                country: match.tournament?.category?.country?.name || '',
                uniqueTournament: match.tournament?.uniqueTournament || {}
              },
              status: {
                description: match.status?.description || 'Finished',
                type: match.status?.type || 'FINISHED'
              },
              homeTeam: {
                id: match.homeTeam?.id || '',
                name: match.homeTeam?.name || 'Home Team',
                shortName: match.homeTeam?.shortName || match.homeTeam?.name?.substring(0, 3) || 'HOM',
                score: match.homeScore?.current || 0
              },
              awayTeam: {
                id: match.awayTeam?.id || '',
                name: match.awayTeam?.name || 'Away Team',
                shortName: match.awayTeam?.shortName || match.awayTeam?.name?.substring(0, 3) || 'AWY',
                score: match.awayScore?.current || 0
              },
              scores: {
                homeHalftime: match.homeScore?.period1 || 0,
                awayHalftime: match.awayScore?.period1 || 0,
                homeFull: match.homeScore?.current || 0,
                awayFull: match.awayScore?.current || 0
              },
              winner: match.winnerCode || 0, // 1 = home team, 2 = away team, 3 = draw
              time: formatPakistanTime(convertToPakistanTime(new Date(match.startTimestamp * 1000))),
              date: new Date(match.startTimestamp * 1000).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })
            }))
            .sort((a, b) => a.time.localeCompare(b.time));
          
          setResults(processedResults);
          setFilteredResults(processedResults);
          
          // Fetch team logos after setting results
          if (processedResults.length > 0) {
            fetchTeamLogos(processedResults);
          }
        } else {
          setResults([]);
          setFilteredResults([]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    const intervalId = setInterval(fetchResults, 900000); // 15 minutes refresh for results
    return () => {
      clearInterval(intervalId);
      // Clean up blob URLs when component unmounts
      Object.values(teamLogos).forEach(logo => {
        if (logo.type === 'blob' && logo.data) {
          URL.revokeObjectURL(logo.data);
        }
      });
    };
  }, []);

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterResults(query, searchCategory);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSearchCategory(category);
    filterResults(searchQuery, category);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredResults(results);
  };

  const filterResults = (query, category) => {
    if (!query.trim()) {
      setFilteredResults(results);
      return;
    }

    const lowerCaseQuery = query.toLowerCase().trim();
    let filtered;

    switch (category) {
      case 'team':
        filtered = results.filter(match => {
          const homeTeamName = match.homeTeam?.name?.toLowerCase() || '';
          const awayTeamName = match.awayTeam?.name?.toLowerCase() || '';
          return homeTeamName.includes(lowerCaseQuery) || awayTeamName.includes(lowerCaseQuery);
        });
        break;
      case 'league':
        filtered = results.filter(match => {
          const leagueName = match.league?.name?.toLowerCase() || '';
          const tournamentName = match.league?.uniqueTournament?.name?.toLowerCase() || '';
          return leagueName.includes(lowerCaseQuery) || tournamentName.includes(lowerCaseQuery);
        });
        break;
      default: // 'all'
        filtered = results.filter(match => {
          const homeTeamName = match.homeTeam?.name?.toLowerCase() || '';
          const awayTeamName = match.awayTeam?.name?.toLowerCase() || '';
          const leagueName = match.league?.name?.toLowerCase() || '';
          const tournamentName = match.league?.uniqueTournament?.name?.toLowerCase() || '';
          return homeTeamName.includes(lowerCaseQuery) || 
                 awayTeamName.includes(lowerCaseQuery) || 
                 leagueName.includes(lowerCaseQuery) ||
                 tournamentName.includes(lowerCaseQuery);
        });
    }

    setFilteredResults(filtered);
  };

  // Re-filter results when the original results array changes
  useEffect(() => {
    filterResults(searchQuery, searchCategory);
  }, [results]);

  // Handler for image load errors using React state
  const handleImageError = (teamId) => {
    setImageErrors(prev => ({
      ...prev,
      [teamId]: true
    }));
  };

  // Enhanced team logo renderer using React state for error handling
  const renderTeamLogo = (teamId, teamName, shortName) => {
    const logoData = teamLogos[teamId];
    const fallbackText = shortName || (teamName ? teamName.charAt(0).toUpperCase() : '?');
    
    // If we already know this image has an error, show fallback immediately
    if (imageErrors[teamId]) {
      return (
        <div className="result-team-logo result-fallback-logo">
          {fallbackText}
        </div>
      );
    }
    
    if (!logoData) {
      // Show loading state if logos are being fetched
      return (
        <div className="result-team-logo result-fallback-logo">
          {logoLoading ? (
            <div className="result-logo-loading"></div>
          ) : (
            fallbackText
          )}
        </div>
      );
    }
    
    switch (logoData.type) {
      case 'blob':
        return (
          <div className="result-team-logo">
            <img 
              src={logoData.data}
              alt={`${teamName} logo`}
              onError={() => handleImageError(teamId)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        );
      case 'fallback':
        return (
          <div className="result-team-logo result-fallback-logo">
            {logoData.data}
          </div>
        );
      default:
        return (
          <div className="result-team-logo result-fallback-logo">
            {fallbackText}
          </div>
        );
    }
  };

  // Function to determine match result styles
  const getResultStyles = (homeScore, awayScore) => {
    if (homeScore > awayScore) {
      return {
        homeClass: 'result-winner',
        awayClass: 'result-loser',
        resultText: 'Home Win'
      };
    } else if (awayScore > homeScore) {
      return {
        homeClass: 'result-loser',
        awayClass: 'result-winner',
        resultText: 'Away Win'
      };
    } else {
      return {
        homeClass: 'result-draw',
        awayClass: 'result-draw',
        resultText: 'Draw'
      };
    }
  };

  if (loading) {
    return (
      <div className="results-wrapper">
        <div className="results-container">
          <div className="result-loading-indicator">
            <div className="result-loading-spinner" />
            <p>Loading match results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-wrapper">
        <div className="results-container">
          <div className="result-error-message">
            <span>Unable to load match results</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-wrapper">
      <div className="results-container">
        <div className="results-header">
          <h2>Match Results</h2>
          
          {/* Add search container */}
          <div className="result-search-container">
            <div className="result-search-input-wrapper">
              <Search className="result-search-icon" size={18} />
              <input
                type="text"
                className="result-search-input"
                placeholder="Search results..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button 
                  className="result-search-clear-button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="result-filter-buttons">
              <button 
                className={`result-filter-button ${searchCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSearchCategory('all')}
              >
                All
              </button>
              <button 
                className={`result-filter-button ${searchCategory === 'team' ? 'active' : ''}`}
                onClick={() => setSearchCategory('team')}
              >
                Teams
              </button>
              <button 
                className={`result-filter-button ${searchCategory === 'league' ? 'active' : ''}`}
                onClick={() => setSearchCategory('league')}
              >
                Leagues
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="result-loading-indicator">
            <div className="result-loading-spinner"></div>
            <p>Loading results...</p>
          </div>
        ) : error ? (
          <div className="result-error-message">
            <span>❌</span>
            <p>{error}</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="result-no-results">
            {searchQuery ? (
              <>
                <span>No results found for "{searchQuery}"</span>
                <p>Try a different search term or category</p>
                <button 
                  className="result-clear-search-btn"
                  onClick={handleClearSearch}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <span>No match results available</span>
                <p>Check back later for match results</p>
              </>
            )}
          </div>
        ) : (
          <div className="results-grid">
            {filteredResults.map((match) => {
              const resultStyles = getResultStyles(match.scores.homeFull, match.scores.awayFull);
              
              return (
                <div key={match.id} className="result-card">
                  <div className="result-header">
                    <div className="result-competition-info">
                      <h3>{match.league.name}</h3>
                      <span className="result-match-date">{match.date}</span>
                    </div>
                    <div className="result-match-status-badge">
                      <span className="result-status">Finished</span>
                    </div>
                  </div>
                  
                  <div className="result-teams-container">
                    <div className={`result-team ${resultStyles.homeClass}`}>
                      <div className="result-team-logo-wrapper">
                        {match.homeTeam.id && renderTeamLogo(
                          match.homeTeam.id, 
                          match.homeTeam.name, 
                          match.homeTeam.shortName
                        )}
                      </div>
                      <div className="result-team-name-wrapper">
                        <span className="result-team-name">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <div className="result-team-score">
                        {match.scores.homeFull}
                      </div>
                    </div>

                    <div className="result-match-separator">
                      <div className="result-badge">
                        {resultStyles.resultText}
                      </div>
                      <div className="result-halftime-score">
                        HT: {match.scores.homeHalftime} - {match.scores.awayHalftime}
                      </div>
                    </div>

                    <div className={`result-team ${resultStyles.awayClass}`}>
                      <div className="result-team-logo-wrapper">
                        {match.awayTeam.id && renderTeamLogo(
                          match.awayTeam.id, 
                          match.awayTeam.name, 
                          match.awayTeam.shortName
                        )}
                      </div>
                      <div className="result-team-name-wrapper">
                        <span className="result-team-name">
                          {match.awayTeam.name}
                        </span>
                      </div>
                      <div className="result-team-score">
                        {match.scores.awayFull}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {logoLoading && (
          <div className="result-logo-loading-message">
            Loading team logos...
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;