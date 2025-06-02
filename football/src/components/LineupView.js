import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import './LineupView.css';
import { useTheme } from '../context/ThemeContext'; // Import theme context

const LineupView = ({ matchId, match, onBack, teamLogos, apiKey }) => {
  const [lineupData, setLineupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState(null);
  const { theme } = useTheme(); // Get current theme

  // Use the API key from props
  const API_HOST = 'allsportsapi2.p.rapidapi.com';
  const API_KEY = 'e80515d439msha47810192b4fb37p10f06ejsn98dcefbf4aaf';

  const fetchLineupData = async (skipRetryIncrement = false) => {
    try {
      if (!skipRetryIncrement) {
        setRetryCount(prev => prev + 1);
      }
      
      setLoading(true);
      setError(null);
      
      const url = `https://allsportsapi2.p.rapidapi.com/api/match/${matchId}/lineups`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST
        }
      };

      console.log(`Fetching lineup data for match ${matchId}...`);
      const response = await fetch(url, options);
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        // Get retry-after header or default to exponential backoff
        const retryAfter = response.headers.get('Retry-After') || Math.min(30, 2 ** retryCount);
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.text();
      console.log('Raw API Response:', rawData);

      // More robust parsing
      let data;
      try {
        // Check if the response is empty
        if (!rawData || rawData.trim() === '') {
          throw new Error('Empty response received from API');
        }
        
        data = JSON.parse(rawData);
        console.log('Parsed Lineup Data:', data);
        
        // Validate minimum required structure
        if (!data || (typeof data !== 'object')) {
          throw new Error('Invalid data format received from API');
        }
        
        // Reset retry count on success
        setRetryCount(0);
        
        // Set the data with more flexible approach
        setLineupData(data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error(`Invalid API response format: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error fetching lineup data:', error);
      
      // Handle rate limiting with automatic retry
      if (error.message.includes('Rate limit exceeded')) {
        const retryAfterMatch = error.message.match(/(\d+)/);
        const retrySeconds = retryAfterMatch ? parseInt(retryAfterMatch[0]) : Math.min(30, 2 ** retryCount);
        
        setError(`Rate limit exceeded. Will retry in ${retrySeconds} seconds...`);
        
        // Clear any existing timeout
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        
        // Set up automatic retry
        const timeout = setTimeout(() => {
          fetchLineupData(true); // Skip incrementing retry count on auto-retry
        }, retrySeconds * 1000);
        
        setRetryTimeout(timeout);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchLineupData();
    }
    
    // Cleanup function to clear any pending retries
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [matchId]);

  // Updated accessor functions with additional error handling and logging
  const getFormation = (isHomeTeam) => {
    try {
      if (!lineupData) return "Unknown";
      
      // Handle different possible data structures
      if (lineupData.home && lineupData.away) {
        // Standard structure
        const teamData = isHomeTeam ? lineupData.home : lineupData.away;
        return teamData && teamData.formation ? teamData.formation : "Unknown";
      } else if (lineupData.data && lineupData.data.home && lineupData.data.away) {
        // Nested data structure
        const teamData = isHomeTeam ? lineupData.data.home : lineupData.data.away;
        return teamData && teamData.formation ? teamData.formation : "Unknown";
      } else if (lineupData.lineup && lineupData.lineup.home && lineupData.lineup.away) {
        // Another possible structure
        const teamData = isHomeTeam ? lineupData.lineup.home : lineupData.lineup.away;
        return teamData && teamData.formation ? teamData.formation : "Unknown";
      }
      
      console.warn('Formation not found in expected data structure:', lineupData);
      return "Unknown";
    } catch (e) {
      console.warn('Error accessing formation data:', e);
      return "Unknown";
    }
  };

  const getLineupPlayers = (team) => {
    try {
      if (!lineupData) return [];
      
      let teamData;
      
      // Handle different possible data structures
      if (lineupData.home && lineupData.away) {
        teamData = team === 'Home' ? lineupData.home : lineupData.away;
      } else if (lineupData.data && lineupData.data.home && lineupData.data.away) {
        teamData = team === 'Home' ? lineupData.data.home : lineupData.data.away;
      } else if (lineupData.lineup && lineupData.lineup.home && lineupData.lineup.away) {
        teamData = team === 'Home' ? lineupData.lineup.home : lineupData.lineup.away;
      } else {
        console.warn('Unable to find team data in lineup structure:', lineupData);
        return [];
      }
      
      if (!teamData) return [];
      
      // Check multiple possible player list locations
      let players = [];
      
      if (teamData.players && Array.isArray(teamData.players)) {
        players = teamData.players;
      } else if (teamData.lineup && Array.isArray(teamData.lineup)) {
        players = teamData.lineup;
      } else if (teamData.starting && Array.isArray(teamData.starting)) {
        players = teamData.starting;
      } else {
        console.warn('No players array found in expected formats:', teamData);
        return [];
      }
      
      // Filter out substitutes
      return players.filter(p => {
        // Handle different possible substitute indicators
        if (p.substitute === true) return false;
        if (p.type && p.type.toLowerCase() === 'substitute') return false;
        if (p.role && p.role.toLowerCase() === 'substitute') return false;
        return true;
      }) || [];
    } catch (e) {
      console.warn('Error accessing lineup players:', e);
      return [];
    }
  };

  const getSubstitutes = (team) => {
    try {
      if (!lineupData) return [];
      
      let teamData;
      
      // Handle different possible data structures
      if (lineupData.home && lineupData.away) {
        teamData = team === 'Home' ? lineupData.home : lineupData.away;
      } else if (lineupData.data && lineupData.data.home && lineupData.data.away) {
        teamData = team === 'Home' ? lineupData.data.home : lineupData.data.away;
      } else if (lineupData.lineup && lineupData.lineup.home && lineupData.lineup.away) {
        teamData = team === 'Home' ? lineupData.lineup.home : lineupData.lineup.away;
      } else {
        console.warn('Unable to find team data in lineup structure:', lineupData);
        return [];
      }
      
      if (!teamData) return [];
      
      // Check multiple possible player list locations
      let allPlayers = [];
      
      if (teamData.players && Array.isArray(teamData.players)) {
        allPlayers = teamData.players;
      } else if (teamData.substitutes && Array.isArray(teamData.substitutes)) {
        // Direct substitutes array
        return teamData.substitutes;
      } else if (teamData.bench && Array.isArray(teamData.bench)) {
        // Direct bench array
        return teamData.bench;
      } else {
        console.warn('No players array found in expected formats:', teamData);
        return [];
      }
      
      // Filter out substitutes
      return allPlayers.filter(p => {
        // Handle different possible substitute indicators
        if (p.substitute === true) return true;
        if (p.type && p.type.toLowerCase() === 'substitute') return true;
        if (p.role && p.role.toLowerCase() === 'substitute') return true;
        return false;
      }) || [];
    } catch (e) {
      console.warn('Error accessing substitutes:', e);
      return [];
    }
  };

  // Render team logo or fallback
  const renderTeamLogo = (team) => {
    const teamId = team === 'Home' 
      ? match?.homeTeam?.id 
      : match?.awayTeam?.id;
      
    const teamName = team === 'Home'
      ? match?.homeTeam?.name
      : match?.awayTeam?.name;
    
    if (!teamId || !teamLogos || !teamLogos[teamId]) {
      return (
        <div className="team-logo-placeholder">
          <div className="team-logo-text">
            {teamName ? teamName.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      );
    }
    
    const logoData = teamLogos[teamId];
    
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

  const renderFormation = (team, isHomeTeam) => {
    const formation = getFormation(isHomeTeam);
    if (formation === "Unknown") return renderBasicPlayerGrid(team);
    
    // Parse formation (e.g., "4-2-3-1" -> [4, 2, 3, 1])
    const parts = formation.split('-').map(part => parseInt(part.trim()));
    if (!parts.length) return renderBasicPlayerGrid(team);
    
    // Get the lineup players for this team
    const players = getLineupPlayers(team);
    if (!players || players.length === 0) return <div className="field-empty">No lineup data available</div>;

    // Sort players by position (GK first, then by position code)
    const sortedPlayers = [...players].sort((a, b) => {
      // Handle different player data structures
      const posA = a.player?.position || a.position || '';
      const posB = b.player?.position || b.position || '';
      
      // Put goalkeeper first
      if ((posA === 'G' || posA === 'GK') && (posB !== 'G' && posB !== 'GK')) return -1;
      if ((posA !== 'G' && posA !== 'GK') && (posB === 'G' || posB === 'GK')) return 1;
      
      // Order by position (D, M, F)
      const posOrder = { 'D': 1, 'DF': 1, 'M': 2, 'MF': 2, 'F': 3, 'FW': 3 };
      return (posOrder[posA] || 99) - (posOrder[posB] || 99);
    });

    // Sort players into positions based on formation
    const positions = [];
    let startIndex = 0;
    
    // Add goalkeeper (always 1)
    positions.push([sortedPlayers[0]]); // Goalkeeper is always the first player
    startIndex = 1;
    
    // Add the rest based on formation
    for (let i = 0; i < parts.length; i++) {
      const count = parts[i];
      const positionPlayers = sortedPlayers.slice(startIndex, startIndex + count);
      positions.push(positionPlayers);
      startIndex += count;
    }

    return (
      <div className="field">
        {positions.map((positionGroup, index) => {
          // Determine the position class
          let positionClass = '';
          if (index === 0) positionClass = 'goalkeeper';
          else if (index === 1) positionClass = 'defenders';
          else if (index === positions.length - 1) positionClass = 'forwards';
          else if (index === positions.length - 2) positionClass = 'attacking-midfielders';
          else positionClass = 'midfielders';

          return (
            <div 
              key={index} 
              className={`field-row ${positionClass}`}
              style={{ gridTemplateColumns: `repeat(${positionGroup.length}, 1fr)` }}
            >
              {positionGroup.map((player) => (
                <div 
                  key={player.player?.id || player.id || `player-${Math.random()}`} 
                  className={`player-card ${team === 'Home' ? 'home-team' : 'away-team'}`}
                >
                  <div className="player-number">
                    {player.shirtNumber || player.jerseyNumber || player.player?.jerseyNumber || player.number || 'N/A'}
                  </div>
                  <div className="player-name">
                    {player.player?.name || player.name || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Fallback rendering method if formation parsing fails
  const renderBasicPlayerGrid = (team) => {
    const players = getLineupPlayers(team);
    if (!players || players.length === 0) return <div className="field-empty">No lineup data available</div>;
    
    // Sort players by position
    const sortedPlayers = [...players].sort((a, b) => {
      // Handle different player data structures
      const posA = a.player?.position || a.position || '';
      const posB = b.player?.position || b.position || '';
      
      // Put goalkeeper first
      if ((posA === 'G' || posA === 'GK') && (posB !== 'G' && posB !== 'GK')) return -1;
      if ((posA !== 'G' && posA !== 'GK') && (posB === 'G' || posB === 'GK')) return 1;
      
      // Order by position (D, M, F)
      const posOrder = { 'D': 1, 'DF': 1, 'M': 2, 'MF': 2, 'F': 3, 'FW': 3 };
      return (posOrder[posA] || 99) - (posOrder[posB] || 99);
    });
    
    // Simple positions - assume 4-4-2 format or based on available players
    const goalkeeper = sortedPlayers.filter(p => {
      const pos = p.player?.position || p.position || '';
      return pos === 'G' || pos === 'GK';
    }).slice(0, 1);
    
    const defenders = sortedPlayers.filter(p => {
      const pos = p.player?.position || p.position || '';
      return pos === 'D' || pos === 'DF';
    }).slice(0, 4);
    
    const midfielders = sortedPlayers.filter(p => {
      const pos = p.player?.position || p.position || '';
      return pos === 'M' || pos === 'MF';
    }).slice(0, 4);
    
    const forwards = sortedPlayers.filter(p => {
      const pos = p.player?.position || p.position || '';
      return pos === 'F' || pos === 'FW' || (!['G', 'GK', 'D', 'DF', 'M', 'MF'].includes(pos));
    }).slice(0, 2);
    
    return (
      <div className="field">
        <div className="field-row goalkeeper" style={{ gridTemplateColumns: '1fr' }}>
          {goalkeeper.map((player) => (
            <div 
              key={player.player?.id || player.id || `player-${Math.random()}`} 
              className={`player-card ${team === 'Home' ? 'home-team' : 'away-team'}`}
            >
              <div className="player-number">
                {player.shirtNumber || player.jerseyNumber || player.player?.jerseyNumber || player.number || 'N/A'}
              </div>
              <div className="player-name">
                {player.player?.name || player.name || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="field-row defenders" style={{ gridTemplateColumns: `repeat(${defenders.length || 1}, 1fr)` }}>
          {defenders.length > 0 ? defenders.map((player) => (
            <div 
              key={player.player?.id || player.id || `player-${Math.random()}`} 
              className={`player-card ${team === 'Home' ? 'home-team' : 'away-team'}`}
            >
              <div className="player-number">
                {player.shirtNumber || player.jerseyNumber || player.player?.jerseyNumber || player.number || 'N/A'}
              </div>
              <div className="player-name">
                {player.player?.name || player.name || 'Unknown'}
              </div>
            </div>
          )) : <div className="empty-position">No defenders</div>}
        </div>
        
        <div className="field-row midfielders" style={{ gridTemplateColumns: `repeat(${midfielders.length || 1}, 1fr)` }}>
          {midfielders.length > 0 ? midfielders.map((player) => (
            <div 
              key={player.player?.id || player.id || `player-${Math.random()}`} 
              className={`player-card ${team === 'Home' ? 'home-team' : 'away-team'}`}
            >
              <div className="player-number">
                {player.shirtNumber || player.jerseyNumber || player.player?.jerseyNumber || player.number || 'N/A'}
              </div>
              <div className="player-name">
                {player.player?.name || player.name || 'Unknown'}
              </div>
            </div>
          )) : <div className="empty-position">No midfielders</div>}
        </div>
        
        <div className="field-row forwards" style={{ gridTemplateColumns: `repeat(${forwards.length || 1}, 1fr)` }}>
          {forwards.length > 0 ? forwards.map((player) => (
            <div 
              key={player.player?.id || player.id || `player-${Math.random()}`} 
              className={`player-card ${team === 'Home' ? 'home-team' : 'away-team'}`}
            >
              <div className="player-number">
                {player.shirtNumber || player.jerseyNumber || player.player?.jerseyNumber || player.number || 'N/A'}
              </div>
              <div className="player-name">
                {player.player?.name || player.name || 'Unknown'}
              </div>
            </div>
          )) : <div className="empty-position">No forwards</div>}
        </div>
      </div>
    );
  };

  const renderSubstitutes = (team) => {
    const subs = getSubstitutes(team);
    if (!subs || subs.length === 0) return <div className="substitutes-empty">No substitutes data</div>;

    return (
      <div className="substitutes-section">
        <h4>Substitutes</h4>
        <div className="substitutes-list">
          {subs.map((sub) => (
            <div 
              key={sub.player?.id || sub.id || `sub-${Math.random()}`} 
              className={`substitute-card ${team === 'Home' ? 'home-team' : 'away-team'}`}
            >
              <div className="sub-number">
                {sub.shirtNumber || sub.jerseyNumber || sub.player?.jerseyNumber || sub.number || 'N/A'}
              </div>
              <div className="sub-name">
                {sub.player?.name || sub.name || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTeamName = (team) => {
    return team === 'Home' 
      ? match?.homeTeam?.name || 'Home Team'
      : match?.awayTeam?.name || 'Away Team';
  };

  // Extract teams information
  const homeTeam = match?.homeTeam?.name || 'Home Team';
  const awayTeam = match?.awayTeam?.name || 'Away Team';
  const homeScore = match?.homeScore?.current || 0;
  const awayScore = match?.awayScore?.current || 0;
  const leagueName = match?.tournament?.uniqueTournament?.name || match?.tournament?.name || 'Unknown League';

  if (loading) {
    return (
      <div className={`lineup-container ${theme === 'dark' ? 'dark-theme' : ''}`} data-theme={theme}>
        <div className="lineup-header">
          <button onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2>Loading Match Lineups</h2>
        </div>
        <div className="loading">
          <Loader2 size={32} className="animate-spin" />
          <p>Loading lineup data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Show green box for empty response, red for other errors
    const isEmptyResponse = error.toLowerCase().includes('empty response');
    return (
      <div className={`lineup-container ${theme === 'dark' ? 'dark-theme' : ''}`} data-theme={theme}>
        <div className="lineup-header">
          <button onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2>Lineup Error</h2>
        </div>
        {isEmptyResponse ? (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '24px',
            margin: '32px auto',
            textAlign: 'center',
            maxWidth: '500px',
            fontWeight: 600
          }}>
            This API is giving an empty response.
          </div>
        ) : (
          <div className="error">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button onClick={() => fetchLineupData()}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`lineup-container ${theme === 'dark' ? 'dark-theme' : ''}`} data-theme={theme}>
      <div className="lineup-header">
        <button onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2>Match Lineups</h2>
      </div>
      
      {/* Match info section */}
      <div className="match-info">
        <div className="league-name">{leagueName}</div>
        <div className="teams-score">
          <div className="team-info">
            {renderTeamLogo('Home')}
            <div className="team-name home-name">{homeTeam}</div>
          </div>
          <div className="score-display">
            <span className="score-value">{homeScore}</span>
            <span className="score-separator">-</span>
            <span className="score-value">{awayScore}</span>
          </div>
          <div className="team-info">
            {renderTeamLogo('Away')}
            <div className="team-name away-name">{awayTeam}</div>
          </div>
        </div>
      </div>
      
      <div className="lineups-content">
        <div className="team-section">
          <h3>
            {getTeamName('Home')} - Formation: {getFormation(true)}
          </h3>
          <div className="formation-container">
            {renderFormation('Home', true)}
            {renderSubstitutes('Home')}
          </div>
        </div>
        
        <div className="team-section">
          <h3>
            {getTeamName('Away')} - Formation: {getFormation(false)}
          </h3>
          <div className="formation-container">
            {renderFormation('Away', false)}
            {renderSubstitutes('Away')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineupView;