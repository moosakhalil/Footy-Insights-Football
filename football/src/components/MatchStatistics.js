import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import './MatchStatistics.css';
import { useTheme } from '../context/ThemeContext';

const MatchStatistics = ({ matchId, match, onBack, teamLogos }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const { theme } = useTheme();

  const fetchMatchStatistics = async () => {
    setLoading(true);
    console.log("Fetching statistics for match ID:", matchId);
    
    const url = `https://allsportsapi2.p.rapidapi.com/api/match/${matchId}/statistics`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'ac8abc1111msh676ab332d96cad6p1213bajsnc1b0645ff63c',
        'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API response for statistics:", result);
      
      // Process the new format statistics
      if (result && result.statistics) {
        setStatistics(result.statistics);
        setError(null);
      } else {
        console.warn("No statistics found in API response:", result);
        setStatistics(null);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching match statistics:', error);
      setError('Failed to fetch match statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMatchStatistics();
      // Auto-refresh every 60 seconds
      const intervalId = setInterval(fetchMatchStatistics, 60000);
      return () => clearInterval(intervalId);
    }
  }, [matchId]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Render team logo or fallback
  const renderTeamLogo = (team) => {
    const teamId = team === 'home' 
      ? match?.homeTeam?.id 
      : match?.awayTeam?.id;
      
    const teamName = team === 'home'
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

  const renderStatBar = (homeStat, awayStat, statName, isPercentage = false) => {
    // Convert to numbers and handle percentage signs
    const homeValue = parseFloat(homeStat);
    const awayValue = parseFloat(awayStat);
    
    // Set colors based on theme
    const homeColor = theme === 'dark' ? '#2196F3' : '#1a78cf';
    const awayColor = theme === 'dark' ? '#ff5722' : '#f44336';
    const bgColor = theme === 'dark' ? '#333333' : '#f0f0f0';
    
    // For percentage bars
    if (isPercentage) {
      return (
        <div className="stat-item">
          <div className="stat-name">{statName}</div>
          <div className="stat-values">
            <div className="home-stat-value">{homeStat}</div>
            <div className="stat-bar-wrapper">
              <div style={{ 
                width: '100%',
                height: '8px', 
                backgroundColor: bgColor,
                borderRadius: '4px',
                marginBottom: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${homeValue}%`, 
                  height: '100%', 
                  backgroundColor: homeColor,
                  borderRadius: '4px',
                  position: 'absolute',
                  left: 0,
                  top: 0
                }}></div>
              </div>
              <div style={{ 
                width: '100%',
                height: '8px', 
                backgroundColor: bgColor,
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${awayValue}%`, 
                  height: '100%', 
                  backgroundColor: awayColor,
                  borderRadius: '4px',
                  position: 'absolute',
                  left: 0,
                  top: 0
                }}></div>
              </div>
            </div>
            <div className="away-stat-value">{awayStat}</div>
          </div>
        </div>
      );
    }
    
    // For regular stat bars (non-percentage)
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

    return (
      <div className="stat-item">
        <div className="stat-name">{statName}</div>
        <div className="stat-values">
          <div className="home-stat-value">{homeStat}</div>
          <div className="stat-bar-wrapper">
            <div style={{ 
              width: '100%',
              height: '8px', 
              backgroundColor: bgColor,
              borderRadius: '4px',
              marginBottom: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${homePercent}%`, 
                height: '100%', 
                backgroundColor: homeColor,
                borderRadius: '4px',
                position: 'absolute',
                left: 0,
                top: 0
              }}></div>
            </div>
            <div style={{ 
              width: '100%',
              height: '8px', 
              backgroundColor: bgColor,
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${awayPercent}%`, 
                height: '100%', 
                backgroundColor: awayColor,
                borderRadius: '4px',
                position: 'absolute',
                left: 0,
                top: 0
              }}></div>
            </div>
          </div>
          <div className="away-stat-value">{awayStat}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="match-stats-container">
        <div className="match-stats-header">
          <button className="back-button" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <h2>Match Statistics</h2>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading match statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    // Show green box for empty response, red for other errors
    const isEmptyResponse = error.toLowerCase().includes('empty response') || error.toLowerCase().includes('no statistics');
    return (
      <div className="match-stats-container">
        <div className="match-stats-header">
          <button className="back-button" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <h2>Match Statistics</h2>
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
            <p>{error}</p>
            <button className="refresh-button" onClick={fetchMatchStatistics}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Extract teams information
  const homeTeam = match?.homeTeam?.name || 'Home Team';
  const awayTeam = match?.awayTeam?.name || 'Away Team';
  const homeScore = match?.homeScore?.current || 0;
  const awayScore = match?.awayScore?.current || 0;
  const leagueName = match?.tournament?.uniqueTournament?.name || match?.tournament?.name || 'Unknown League';

  // Find the current period statistics
  const currentPeriodStats = statistics?.find(stat => stat.period === activeTab);
  
  // Get tabs from available periods
  const availablePeriods = statistics?.map(stat => stat.period) || [];

  // Check if we have statistics to display
  const hasStatistics = currentPeriodStats && currentPeriodStats.groups && currentPeriodStats.groups.length > 0;

  return (
    <div className="match-stats-container">
      <div className="match-stats-header">
        <button className="back-button" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <h2>Match Statistics</h2>
      </div>

      <div className="match-info">
        <div className="league-name">{leagueName}</div>
        <div className="teams-score">
          <div className="team-info">
            {renderTeamLogo('home')}
            <div className="team-name home-name">{homeTeam}</div>
          </div>
          <div className="score-display">
            <span className="score-value">{homeScore}</span>
            <span className="score-separator">-</span>
            <span className="score-value">{awayScore}</span>
          </div>
          <div className="team-info">
            {renderTeamLogo('away')}
            <div className="team-name away-name">{awayTeam}</div>
          </div>
        </div>
      </div>

      <div className="statistics-container">
        <div className="period-tabs">
          {availablePeriods.map((period, index) => {
            // Format period names for display
            let displayName = period;
            if (period === 'ALL') displayName = 'Full Match';
            if (period === '1ST') displayName = '1st Half';
            if (period === '2ND') displayName = '2nd Half';
            
            return (
              <button 
                key={index} 
                className={`period-tab ${activeTab === period ? 'active' : ''}`}
                onClick={() => handleTabChange(period)}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        <div className="team-headers">
          <div className="team-header home-header">
            {renderTeamLogo('home')}
            <span>{homeTeam}</span>
          </div>
          <div className="team-header stats-label">Statistics</div>
          <div className="team-header away-header">
            {renderTeamLogo('away')}
            <span>{awayTeam}</span>
          </div>
        </div>
        
        <div className="stats-list">
          {hasStatistics ? (
            <>
              {currentPeriodStats.groups.map((group, groupIndex) => (
                <div key={groupIndex} className="stats-group">
                  <h3 className="group-header">{group.groupName}</h3>
                  {group.statisticsItems.map((item, itemIndex) => {
                    // Determine if this is a percentage stat
                    const isPercentage = item.renderType === 2;
                    return (
                      <div key={itemIndex}>
                        {renderStatBar(item.home, item.away, item.name, isPercentage)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            <div className="no-stats-wrapper">
              <div className="no-stats">
                <p>No detailed statistics available for this match yet</p>
                <p className="sub-message">Statistics typically appear once the match has started or after a few minutes of play</p>
                <button className="refresh-button" onClick={fetchMatchStatistics}>
                  <RefreshCw size={16} /> Check Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stats-footer">
        <button className="refresh-button" onClick={fetchMatchStatistics}>
          <RefreshCw size={16} /> Refresh Stats
        </button>
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchStatistics;