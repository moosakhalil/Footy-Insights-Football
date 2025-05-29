import React, { useState, useEffect } from 'react';
import { Shield, Search, X } from 'lucide-react';
import './Fixtures.css';
import { useTheme } from '../context/ThemeContext';

const TOP_LEAGUES = [
  { id: 'premier-league', name: 'Premier League' },
  { id: 'la-liga', name: 'La Liga' },
  { id: 'bundesliga', name: 'Bundesliga' },
  { id: 'serie-a', name: 'Serie A' },
  { id: 'ligue-1', name: 'Ligue 1' },
  { id: 'champions-league', name: 'UEFA Champions League' },
  { id: 'europa-league', name: 'UEFA Europa League' },
  { id: 'eredivisie', name: 'Eredivisie' },
  { id: 'primeira-liga', name: 'Primeira Liga' },
  { id: 'super-lig', name: 'Super Lig' }
];

// Pakistan is UTC+5
const PAKISTAN_TIME_OFFSET = 5 * 60 * 60 * 1000;

const Fixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all'); // 'all', 'team', 'league'
  const { theme } = useTheme();
  // Add a centralized state for team logos like in LiveScores
  const [teamLogos, setTeamLogos] = useState({});
  const [logoLoading, setLogoLoading] = useState(false);
  // Track image load errors
  const [imageErrors, setImageErrors] = useState({});

  // API key for consistency
  const API_KEY = ' 593ae17a30msha9ad81db8305048p1f1c99jsn2c6c7b2d5637';
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
  const createFallbackLogo = (teamId, fixturesData, logoStore) => {
    const fixtureWithTeam = fixturesData.find(fixture => 
      fixture.homeTeam?.id === teamId || fixture.awayTeam?.id === teamId
    );
    const teamName = fixtureWithTeam?.homeTeam?.id === teamId 
      ? fixtureWithTeam.homeTeam.name 
      : fixtureWithTeam?.awayTeam?.name;
    
    logoStore[teamId] = { 
      type: 'fallback', 
      data: teamName ? teamName.charAt(0).toUpperCase() : '?'
    };
  };

  // Function to fetch team logos
  const fetchTeamLogos = async (fixturesData) => {
    setLogoLoading(true);
    
    // Create a list of unique team IDs and track existing logos
    const teamIds = new Set();
    fixturesData.forEach(fixture => {
      if (fixture.homeTeam?.id && !teamLogos[fixture.homeTeam.id]) {
        teamIds.add(fixture.homeTeam.id);
      }
      if (fixture.awayTeam?.id && !teamLogos[fixture.awayTeam.id]) {
        teamIds.add(fixture.awayTeam.id);
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
            'x-rapidapi-key': ' 593ae17a30msha9ad81db8305048p1f1c99jsn2c6c7b2d5637',
            'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com'
          }
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          console.warn(`Could not fetch logo for team ${teamId}: ${response.status}`);
          createFallbackLogo(teamId, fixturesData, newTeamLogos);
          continue;
        }
        
        // Try to get the image as a blob
        try {
          const imageBlob = await response.blob();
          if (imageBlob.size > 0) {
            const logoUrl = URL.createObjectURL(imageBlob);
            newTeamLogos[teamId] = { type: 'blob', data: logoUrl };
          } else {
            createFallbackLogo(teamId, fixturesData, newTeamLogos);
          }
        } catch (blobError) {
          console.warn(`Failed to process image as blob for team ${teamId}`);
          createFallbackLogo(teamId, fixturesData, newTeamLogos);
        }
      } catch (error) {
        console.error(`Error fetching logo for team ${teamId}:`, error);
        createFallbackLogo(teamId, fixturesData, newTeamLogos);
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

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterFixtures(query, searchCategory);
  };

  const handleCategoryChange = (category) => {
    setSearchCategory(category);
    filterFixtures(searchQuery, category);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredFixtures(fixtures);
  };

  const filterFixtures = (query, category) => {
    if (!query.trim()) {
      setFilteredFixtures(fixtures);
      return;
    }

    const lowerCaseQuery = query.toLowerCase().trim();
    let filtered;

    switch (category) {
      case 'team':
        filtered = fixtures.filter(fixture => {
          const homeTeamName = fixture.homeTeam?.name?.toLowerCase() || '';
          const awayTeamName = fixture.awayTeam?.name?.toLowerCase() || '';
          return homeTeamName.includes(lowerCaseQuery) || awayTeamName.includes(lowerCaseQuery);
        });
        break;
      case 'league':
        filtered = fixtures.filter(fixture => {
          const leagueName = fixture.league?.name?.toLowerCase() || '';
          return leagueName.includes(lowerCaseQuery);
        });
        break;
      case 'all':
      default:
        filtered = fixtures.filter(fixture => {
          const homeTeamName = fixture.homeTeam?.name?.toLowerCase() || '';
          const awayTeamName = fixture.awayTeam?.name?.toLowerCase() || '';
          const leagueName = fixture.league?.name?.toLowerCase() || '';
          return homeTeamName.includes(lowerCaseQuery) || 
                 awayTeamName.includes(lowerCaseQuery) || 
                 leagueName.includes(lowerCaseQuery);
        });
    }

    setFilteredFixtures(filtered);
  };

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const today = new Date();
        const formattedDate = getFormattedDate(today);
        
        const url = `https://allsportsapi2.p.rapidapi.com/api/matches/${formattedDate}`;
        
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': ' 593ae17a30msha9ad81db8305048p1f1c99jsn2c6c7b2d5637'
          }
        };

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
          const processedFixtures = data.events
            .filter(fixture => {
              const isNotStarted = fixture.status?.type === 'NOT_STARTED' || 
                                 fixture.status?.description === 'Not started' ||
                                 fixture.status?.description === 'Scheduled';
              
              // Only include top leagues for better quality results
              const isTopLeague = TOP_LEAGUES.some(league => 
                fixture.tournament?.name?.toLowerCase().includes(league.name.toLowerCase())
              );
              
              return isNotStarted && isTopLeague;
            })
            .map(fixture => ({
              id: fixture.id || '',
              league: {
                name: fixture.tournament?.name || 'Unknown League',
                country: fixture.tournament?.category?.country?.name || '',
                uniqueTournament: fixture.tournament?.uniqueTournament || {}
              },
              status: {
                description: fixture.status?.description || 'Scheduled',
                type: fixture.status?.type || 'SCHEDULED'
              },
              homeTeam: {
                id: fixture.homeTeam?.id || '',
                name: fixture.homeTeam?.name || 'Home Team',
                shortName: fixture.homeTeam?.shortName || fixture.homeTeam?.name?.substring(0, 3) || 'HOM'
              },
              awayTeam: {
                id: fixture.awayTeam?.id || '',
                name: fixture.awayTeam?.name || 'Away Team',
                shortName: fixture.awayTeam?.shortName || fixture.awayTeam?.name?.substring(0, 3) || 'AWY'
              },
              time: formatPakistanTime(convertToPakistanTime(new Date(fixture.startTimestamp * 1000))),
              date: new Date(fixture.startTimestamp * 1000).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })
            }))
            .sort((a, b) => a.time.localeCompare(b.time));
          
          setFixtures(processedFixtures);
          setFilteredFixtures(processedFixtures);
          
          // Fetch team logos after setting fixtures
          if (processedFixtures.length > 0) {
            fetchTeamLogos(processedFixtures);
          }
        } else {
          setFixtures([]);
          setFilteredFixtures([]);
        }
      } catch (error) {
        console.error('Error fetching fixtures:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
    const intervalId = setInterval(fetchFixtures, 300000); // 5 minutes
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
        <div className="team-logo fallback-logo">
          {fallbackText}
        </div>
      );
    }
    
    if (!logoData) {
      // Show loading state if logos are being fetched
      return (
        <div className="team-logo fallback-logo">
          {logoLoading ? (
            <div className="logo-loading"></div>
          ) : (
            fallbackText
          )}
        </div>
      );
    }
    
    switch (logoData.type) {
      case 'blob':
        return (
          <div className="team-logo">
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
          <div className="team-logo fallback-logo">
            {logoData.data}
          </div>
        );
      default:
        return (
          <div className="team-logo fallback-logo">
            {fallbackText}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixtures-wrapper">
        <div className="fixtures-container">
          <div className="loading-indicator">
            <div className="loading-spinner" />
            <p>Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixtures-wrapper">
        <div className="fixtures-container">
          <div className="error-message">
            <span>Unable to load matches</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixtures-wrapper">
      <div className="fixtures-container">
        <div className="fixtures-header">
          <h2>Upcoming Fixtures</h2>
          
          {/* Search container */}
          <div className="fixtures-search-container">
            <div className="fixtures-search-input-wrapper">
              <Search className="fixtures-search-icon" size={18} />
              <input
                type="text"
                className="fixtures-search-input"
                placeholder="Search fixtures..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button 
                  className="fixtures-clear-search-btn"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="fixtures-search-type-toggle">
              <button 
                className={`fixtures-search-type-option ${searchCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All
              </button>
              <button 
                className={`fixtures-search-type-option ${searchCategory === 'team' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('team')}
              >
                Teams
              </button>
              <button 
                className={`fixtures-search-type-option ${searchCategory === 'league' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('league')}
              >
                Leagues
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading fixtures...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <span>❌</span>
            <p>{error}</p>
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="fixtures-no-results">
            {searchQuery ? (
              <>
                <span>No fixtures found for "{searchQuery}"</span>
                <p>Try a different search term or category</p>
                <button 
                  className="fixtures-clear-search-btn large"
                  onClick={clearSearch}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <span>No upcoming fixtures available</span>
                <p>Check back later for upcoming matches</p>
              </>
            )}
          </div>
        ) : (
          <div className="fixtures-grid">
            {filteredFixtures.map((fixture) => (
              <div key={fixture.id} className="fixture-card">
                <div className="fixture-header">
                  <div className="competition-info">
                    <h3>{fixture.league.name}</h3>
                    <span className="match-date">{fixture.date}</span>
                  </div>
                  <div className="match-time-badge">
                    {fixture.time}
                  </div>
                </div>
                
                <div className="teams-container">
                  <div className="team">
                    <div className="team-logo-wrapper">
                      {fixture.homeTeam.id && renderTeamLogo(
                        fixture.homeTeam.id, 
                        fixture.homeTeam.name, 
                        fixture.homeTeam.shortName
                      )}
                    </div>
                    <div className="team-name-wrapper">
                      <span className="team-name">
                        {fixture.homeTeam.name}
                      </span>
                    </div>
                  </div>

                  <div className="match-separator">
                    <span>VS</span>
                  </div>

                  <div className="team">
                    <div className="team-logo-wrapper">
                      {fixture.awayTeam.id && renderTeamLogo(
                        fixture.awayTeam.id, 
                        fixture.awayTeam.name, 
                        fixture.awayTeam.shortName
                      )}
                    </div>
                    <div className="team-name-wrapper">
                      <span className="team-name">
                        {fixture.awayTeam.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fixtures;