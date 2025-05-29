import React, { useState } from 'react';
import { Search, Award, Users, MapPin, Flag, User, Star, ArrowLeft, Home, Calendar, Activity, Target, Shield } from 'react-feather';
import './TeamsInfo.css';

const TeamsInfo = () => {
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeView, setActiveView] = useState(null); // 'details', 'matches', or 'stats'

  const fetchTeamLogo = async (teamId) => {
    try {
      const url = `https://divanscore.p.rapidapi.com/teams/get-logo?teamId=${teamId}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '8a3ce71da3mshb7601f1a54e4fcep125815jsn93a79ed77f1e',
          'x-rapidapi-host': 'divanscore.p.rapidapi.com'
        }
      };

      const response = await fetch(url, options);
      if (response.ok) {
        const logoBlob = await response.blob();
        return URL.createObjectURL(logoBlob);
      }
      return null;
    } catch (error) {
      console.error('Error fetching team logo:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!teamName.trim()) return;
    
    setLoading(true);
    try {
      const url = `https://divanscore.p.rapidapi.com/teams/search?name=${encodeURIComponent(teamName)}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '8a3ce71da3mshb7601f1a54e4fcep125815jsn93a79ed77f1e',
          'x-rapidapi-host': 'divanscore.p.rapidapi.com'
        }
      };

      const response = await fetch(url, options);
      const result = await response.json();
      
      if (result.teams && result.teams.length > 0) {
        const teamsWithLogos = await Promise.all(
          result.teams.map(async (team) => {
            const logoUrl = await fetchTeamLogo(team.id);
            return {
              ...team,
              logo: logoUrl
            };
          })
        );
        setTeams(teamsWithLogos);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = async (team, view) => {
    setLoading(true);
    setActiveView(view);
    try {
      const [detailsResponse, matchesResponse, statsResponse, lastMatchesResponse] = await Promise.all([
        fetch(`https://divanscore.p.rapidapi.com/teams/detail?teamId=${team.id}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '8a3ce71da3mshb7601f1a54e4fcep125815jsn93a79ed77f1e',
            'x-rapidapi-host': 'divanscore.p.rapidapi.com'
          }
        }),
        fetch(`https://divanscore.p.rapidapi.com/teams/get-next-matches?teamId=${team.id}&pageIndex=0`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '8a3ce71da3mshb7601f1a54e4fcep125815jsn93a79ed77f1e',
            'x-rapidapi-host': 'divanscore.p.rapidapi.com'
          }
        }),
        fetch(`https://divanscore.p.rapidapi.com/teams/get-statistics?teamId=${team.id}&tournamentId=7&seasonId=29267&type=overall`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '8a3ce71da3mshb7601f1a54e4fcep125815jsn93a79ed77f1e',
            'x-rapidapi-host': 'divanscore.p.rapidapi.com'
          }
        }),
        fetch(`https://divanscore.p.rapidapi.com/teams/get-last-matches?teamId=${team.id}&pageIndex=0`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '8a3ce71da3mshb7601f1a54e4fcep125815jsn93a79ed77f1e',
            'x-rapidapi-host': 'divanscore.p.rapidapi.com'
          }
        })
      ]);

      const [detailsResult, matchesResult, statsResult, lastMatchesResult] = await Promise.all([
        detailsResponse.json(),
        matchesResponse.json(),
        statsResponse.json(),
        lastMatchesResponse.json()
      ]);

      // Add team logos to matches
      const matchesWithLogos = await Promise.all(
        (matchesResult.events || []).map(async (match) => {
          const [homeLogo, awayLogo] = await Promise.all([
            fetchTeamLogo(match.homeTeam.id),
            fetchTeamLogo(match.awayTeam.id)
          ]);
          return {
            ...match,
            homeTeam: { ...match.homeTeam, logo: homeLogo },
            awayTeam: { ...match.awayTeam, logo: awayLogo }
          };
        })
      );

      // Add team logos to last matches
      const lastMatchesWithLogos = await Promise.all(
        (lastMatchesResult.events || []).map(async (match) => {
          const [homeLogo, awayLogo] = await Promise.all([
            fetchTeamLogo(match.homeTeam.id),
            fetchTeamLogo(match.awayTeam.id)
          ]);
          return {
            ...match,
            homeTeam: { ...match.homeTeam, logo: homeLogo },
            awayTeam: { ...match.awayTeam, logo: awayLogo }
          };
        })
      );

      setSelectedTeam({
        ...team,
        details: detailsResult.team,
        form: detailsResult.pregameForm,
        nextMatches: matchesWithLogos,
        lastMatches: lastMatchesWithLogos,
        statistics: statsResult.statistics
      });
    } catch (error) {
      console.error('Error fetching team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.reload();
  };

  const formatUserCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatMatchDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="teams-info">
      {!selectedTeam && (
        <div className="search-section">
          <h1 className="title">
            <span className="white-text">Team</span> Search
          </h1>
          
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>Loading team information...</p>
        </div>
      ) : selectedTeam ? (
        <div className="team-detail-card">
          <div className="team-header">
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={18} />
            </button>
            {selectedTeam.logo && (
              <img src={selectedTeam.logo} alt={`${selectedTeam.name} logo`} className="team-logo-large" />
            )}
            <h2 className="team-name">{selectedTeam.name}</h2>
            <span className="team-code">{selectedTeam.nameCode}</span>
          </div>

          <div className="view-toggle">
            <button 
              className={`view-button ${activeView === 'details' ? 'active' : ''}`}
              onClick={() => setActiveView('details')}
            >
              Team Details
            </button>
            <button 
              className={`view-button ${activeView === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveView('matches')}
            >
              Next Matches
            </button>
            <button 
              className={`view-button ${activeView === 'last-matches' ? 'active' : ''}`}
              onClick={() => setActiveView('last-matches')}
            >
              Last Matches
            </button>
            <button 
              className={`view-button ${activeView === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveView('stats')}
            >
              Statistics
            </button>
          </div>
          
          {activeView === 'details' && (
            <>
              <div className="team-info-grid">
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <div>
                    <strong>Country</strong>
                    <span>{selectedTeam.details?.country?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Users className="info-icon" />
                  <div>
                    <strong>Followers</strong>
                    <span>{selectedTeam.details?.userCount ? formatUserCount(selectedTeam.details.userCount) : 'N/A'}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <User className="info-icon" />
                  <div>
                    <strong>Gender</strong>
                    <span>{selectedTeam.details?.gender === 'M' ? 'Men' : selectedTeam.details?.gender === 'F' ? 'Women' : 'Mixed'}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Flag className="info-icon" />
                  <div>
                    <strong>National</strong>
                    <span>{selectedTeam.details?.national ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <Award className="info-icon" />
                  <div>
                    <strong>League</strong>
                    <span>{selectedTeam.details?.tournament?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <Home className="info-icon" />
                  <div>
                    <strong>Stadium</strong>
                    <span>{selectedTeam.details?.venue?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div>
                    <strong>Founded</strong>
                    <span>{selectedTeam.details?.foundationDateTimestamp ? new Date(selectedTeam.details.foundationDateTimestamp * 1000).getFullYear() : 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <Star className="info-icon" />
                  <div>
                    <strong>Manager</strong>
                    <span>{selectedTeam.details?.manager?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedTeam.form && (
                <div className="team-form-section">
                  <h3>Recent Form</h3>
                  <div className="form-indicators">
                    {selectedTeam.form.form.map((result, index) => (
                      <span key={index} className={`form-indicator ${result.toLowerCase()}`}>
                        {result}
                      </span>
                    ))}
                  </div>
                  <div className="form-stats">
                    <div className="form-stat">
                      <strong>Average Rating</strong>
                      <span>{selectedTeam.form.avgRating}</span>
                    </div>
                    <div className="form-stat">
                      <strong>Position</strong>
                      <span>{selectedTeam.form.position}</span>
                    </div>
                    <div className="form-stat">
                      <strong>Form Value</strong>
                      <span>{selectedTeam.form.value}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeView === 'matches' && (
            <div className="matches-section">
              <h3>Upcoming Matches</h3>
              <div className="matches-list">
                {selectedTeam.nextMatches.map((match) => (
                  <div key={match.id} className="match-card">
                    <div className="match-header">
                      <div className="tournament-info">
                        <span className="tournament-name">{match.tournament.name}</span>
                        <span className="match-round">
                          {match.roundInfo.name || `Round ${match.roundInfo.round}`}
                        </span>
                      </div>
                      <span className="match-date">
                        {new Date(match.startTimestamp * 1000).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="match-teams">
                      <div className="team home-team">
                        {match.homeTeam.logo && (
                          <img 
                            src={match.homeTeam.logo} 
                            alt={`${match.homeTeam.name} logo`} 
                            className="team-logo-small"
                          />
                        )}
                        <div className="team-info">
                          <span className="team-name">{match.homeTeam.name}</span>
                          <span className="team-code">{match.homeTeam.nameCode}</span>
                        </div>
                      </div>
                      <div className="match-vs">VS</div>
                      <div className="team away-team">
                        {match.awayTeam.logo && (
                          <img 
                            src={match.awayTeam.logo} 
                            alt={`${match.awayTeam.name} logo`} 
                            className="team-logo-small"
                          />
                        )}
                        <div className="team-info">
                          <span className="team-name">{match.awayTeam.name}</span>
                          <span className="team-code">{match.awayTeam.nameCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="match-info">
                      <div className="match-venue">
                        <Calendar size={14} />
                        <span>{new Date(match.startTimestamp * 1000).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}</span>
                      </div>
                      {match.status.description !== "Not started" && (
                        <span className="match-status">{match.status.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'last-matches' && selectedTeam.lastMatches && (
            <div className="matches-section last-matches">
              <h3>Last Matches</h3>
              <div className="matches-list">
                {selectedTeam.lastMatches
                  .sort((a, b) => b.startTimestamp - a.startTimestamp)
                  .map((match) => {
                    // Get scores from the score object, fallback to display or current
                    const homeScore = match.homeScore?.display || 
                                    match.homeScore?.current || 
                                    (match.score ? match.score.split('-')[0].trim() : '0');
                    const awayScore = match.awayScore?.display || 
                                    match.awayScore?.current || 
                                    (match.score ? match.score.split('-')[1].trim() : '0');
                    
                    // Ensure we have valid numbers for comparison
                    const homeScoreNum = parseInt(homeScore) || 0;
                    const awayScoreNum = parseInt(awayScore) || 0;
                    
                    const isFinished = match.status?.type === 'finished' || match.status?.description === 'Finished';
                    const isInProgress = match.status?.type === 'inprogress' || match.status?.description?.includes('In Progress');
                    const isPostponed = match.status?.type === 'postponed' || match.status?.description === 'Postponed';
                    const isCancelled = match.status?.type === 'cancelled' || match.status?.description === 'Cancelled';
                    
                    const homeWinner = isFinished && homeScoreNum > awayScoreNum;
                    const awayWinner = isFinished && homeScoreNum < awayScoreNum;
                    const isDraw = isFinished && homeScoreNum === awayScoreNum;
                    
                    return (
                      <div key={match.id} className="match-card">
                        <div className="match-header">
                          <div className="tournament-info">
                            <span className="tournament-name">{match.tournament.name}</span>
                            <span className="match-round">
                              {match.roundInfo.name || `Round ${match.roundInfo.round}`}
                            </span>
                          </div>
                          <span className="match-date">
                            {formatMatchDate(match.startTimestamp)}
                          </span>
                        </div>
                        <div className="match-teams">
                          <div className="team home-team">
                            {match.homeTeam.logo && (
                              <img 
                                src={match.homeTeam.logo} 
                                alt={`${match.homeTeam.name} logo`} 
                                className="team-logo-small"
                              />
                            )}
                            <div className={`team-info ${isFinished ? (homeWinner ? 'winner' : isDraw ? 'draw' : 'loser') : ''}`}>
                              <span className="team-name">{match.homeTeam.name}</span>
                              <span className="team-score">
                                {isFinished ? homeScoreNum : isInProgress ? homeScoreNum : isPostponed ? 'PP' : isCancelled ? 'CAN' : '-'}
                              </span>
                            </div>
                          </div>
                          <div className="match-vs">VS</div>
                          <div className="team away-team">
                            {match.awayTeam.logo && (
                              <img 
                                src={match.awayTeam.logo} 
                                alt={`${match.awayTeam.name} logo`} 
                                className="team-logo-small"
                              />
                            )}
                            <div className={`team-info ${isFinished ? (awayWinner ? 'winner' : isDraw ? 'draw' : 'loser') : ''}`}>
                              <span className="team-name">{match.awayTeam.name}</span>
                              <span className="team-score">
                                {isFinished ? awayScoreNum : isInProgress ? awayScoreNum : isPostponed ? 'PP' : isCancelled ? 'CAN' : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="match-info">
                          <div className="match-result">
                            {match.status.description}
                          </div>
                          <div className="match-venue">
                            <Calendar size={14} />
                            <span>{new Date(match.startTimestamp * 1000).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeView === 'stats' && selectedTeam.statistics && (
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stats-category">
                  <h3><Activity size={18} /> Attacking</h3>
                  <div className="stats-items">
                    <div className="stats-item">
                      <strong>Goals Scored</strong>
                      <span>{selectedTeam.statistics.goalsScored}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Shots</strong>
                      <span>{selectedTeam.statistics.shots}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Shots on Target</strong>
                      <span>{selectedTeam.statistics.shotsOnTarget}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Big Chances Created</strong>
                      <span>{selectedTeam.statistics.bigChancesCreated}</span>
                    </div>
                  </div>
                </div>

                <div className="stats-category">
                  <h3><Target size={18} /> Possession</h3>
                  <div className="stats-items">
                    <div className="stats-item">
                      <strong>Average Possession</strong>
                      <span>{selectedTeam.statistics.averageBallPossession.toFixed(1)}%</span>
                    </div>
                    <div className="stats-item">
                      <strong>Pass Accuracy</strong>
                      <span>{selectedTeam.statistics.accuratePassesPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="stats-item">
                      <strong>Total Passes</strong>
                      <span>{selectedTeam.statistics.totalPasses}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Successful Dribbles</strong>
                      <span>{selectedTeam.statistics.successfulDribbles}</span>
                    </div>
                  </div>
                </div>

                <div className="stats-category">
                  <h3><Shield size={18} /> Defending</h3>
                  <div className="stats-items">
                    <div className="stats-item">
                      <strong>Clean Sheets</strong>
                      <span>{selectedTeam.statistics.cleanSheets}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Goals Conceded</strong>
                      <span>{selectedTeam.statistics.goalsConceded}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Tackles</strong>
                      <span>{selectedTeam.statistics.tackles}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Interceptions</strong>
                      <span>{selectedTeam.statistics.interceptions}</span>
                    </div>
                  </div>
                </div>

                <div className="stats-category">
                  <h3><Flag size={18} /> Discipline</h3>
                  <div className="stats-items">
                    <div className="stats-item">
                      <strong>Yellow Cards</strong>
                      <span>{selectedTeam.statistics.yellowCards}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Red Cards</strong>
                      <span>{selectedTeam.statistics.redCards}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Fouls</strong>
                      <span>{selectedTeam.statistics.fouls}</span>
                    </div>
                    <div className="stats-item">
                      <strong>Offsides</strong>
                      <span>{selectedTeam.statistics.offsides}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="teams-list">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-header">
                {team.logo && (
                  <img src={team.logo} alt={`${team.name} logo`} className="team-logo" />
                )}
                <h3 className="team-name">{team.name}</h3>
                <span className="team-code">{team.nameCode}</span>
              </div>
              
              <div className="team-details">
                <div className="team-info">
                  <MapPin size={16} />
                  <span>{team.country?.name || 'Unknown'}</span>
                </div>
                <div className="team-info">
                  <Users size={16} />
                  <span>{team.userCount || 'N/A'} followers</span>
                </div>
              </div>

              <div className="team-actions">
                <button 
                  className="action-button details-button"
                  onClick={() => handleTeamSelect(team, 'details')}
                >
                  Team Details
                </button>
                <button 
                  className="action-button matches-button"
                  onClick={() => handleTeamSelect(team, 'matches')}
                >
                  Next Matches
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsInfo; 