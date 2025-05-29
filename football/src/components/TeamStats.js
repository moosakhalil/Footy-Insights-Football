import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Award, TrendingUp, Users, Activity, Target, Shield, Zap, Trophy, Star, Slash, CircleX, CircleCheck, TrendingDown, RefreshCw, Info } from 'lucide-react';
import './TeamStats.css';

const TOP_TEAMS = [
  { id: 1, name: 'Arsenal', fullName: 'Arsenal', logo: '/logos/Arsenal.png', color: '#DB0007', secondaryColor: '#023474' },
  { id: 12, name: 'Manchester C', fullName: 'Manchester City', logo: '/logos/MC.png', color: '#6CABDD', secondaryColor: '#1C2C5B' },
  { id: 11, name: 'Liverpool', fullName: 'Liverpool', logo: '/logos/LV.png', color: '#C8102E', secondaryColor: '#00A398' },
  { id: 13, name: 'Manchester U', fullName: 'Manchester United', logo: '/logos/MU.png', color: '#DA291C', secondaryColor: '#FBE122' },
  { id: 19, name: 'Tottenham', fullName: 'Tottenham Hotspur', logo: '/logos/THN.png', color: '#132257', secondaryColor: '#FFFFFF' },
  { id: 7, name: 'Chelsea', fullName: 'Chelsea', logo: '/logos/CH.png', color: '#034694', secondaryColor: '#EE242C' },
  { id: 2, name: 'Aston Villa', fullName: 'Aston Villa', logo: '/logos/AV.png', color: '#670E36', secondaryColor: '#95BFE5' },
  { id: 15, name: 'Newcastle', fullName: 'Newcastle United', logo: '/logos/NC.png', color: '#241F20', secondaryColor: '#FFFFFF' },
  { id: 9, name: 'Everton', fullName: 'Everton', logo: '/logos/EV.png', color: '#003399', secondaryColor: '#FFFFFF' },
  { id: 42, name: 'West Ham', fullName: 'West Ham United', logo: '/logos/WH.png', color: '#7A263A', secondaryColor: '#1BB1E7' }
];

const TeamStats = () => {
  const [selectedTeam, setSelectedTeam] = useState(TOP_TEAMS[0]);
  const [teamStats, setTeamStats] = useState(null);
  const [sequences, setSequences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sequences');
  const [hoveredCard, setHoveredCard] = useState(null);
  const statsRef = useRef(null);
  const teamsGridRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // Add a subtle parallax effect to the teams grid
      if (teamsGridRef.current) {
        const scrollPosition = window.scrollY;
        teamsGridRef.current.style.transform = `translateY(${scrollPosition * 0.05}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchTeamData = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'ac8abc1111msh676ab332d96cad6p1213bajsnc1b0645ff63c',
          'x-rapidapi-host': 'football-web-pages1.p.rapidapi.com'
        }
      };

      const [statsResponse, sequencesResponse] = await Promise.all([
        fetch(`https://football-web-pages1.p.rapidapi.com/records.json?comp=1&team=${teamId}`, options),
        fetch(`https://football-web-pages1.p.rapidapi.com/sequences.json?team=${teamId}`, options)
      ]);

      const [statsData, sequencesData] = await Promise.all([
        statsResponse.json(),
        sequencesResponse.json()
      ]);

      setTeamStats(statsData.records);
      setSequences(sequencesData.sequences);
    } catch (err) {
      setError('Failed to fetch team data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData(selectedTeam.id);
  }, [selectedTeam, fetchTeamData]);

  const handleRefresh = () => {
    fetchTeamData(selectedTeam.id);
  };

  const handleTeamSelect = (teamId) => {
    const newTeam = TOP_TEAMS.find(team => team.id === teamId);
    if (newTeam) {
      setSelectedTeam(newTeam);
      
      // Smoothly scroll to stats section when changing teams
      if (statsRef.current) {
        try {
          setTimeout(() => {
            statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } catch (err) {
          console.log('Could not scroll to stats section');
        }
      }
      
      // Optional: Center the selected team in the horizontal list
      const teamElement = document.querySelector(`.ts-team-item[data-team-id="${teamId}"]`);
      if (teamElement && teamsGridRef.current) {
        const containerRect = teamsGridRef.current.getBoundingClientRect();
        const teamRect = teamElement.getBoundingClientRect();
        const scrollAmount = teamRect.left - containerRect.left - (containerRect.width / 2) + (teamRect.width / 2);
        
        teamsGridRef.current.scrollTo({
          left: teamsGridRef.current.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getResultIndicator = (homeScore, awayScore, isHomeTeam) => {
    if (homeScore > awayScore) {
      return isHomeTeam ? <CircleCheck size={16} className="result-icon win" /> : <CircleX size={16} className="result-icon loss" />;
    } else if (homeScore < awayScore) {
      return isHomeTeam ? <CircleX size={16} className="result-icon loss" /> : <CircleCheck size={16} className="result-icon win" />;
    } else {
      return <Slash size={16} className="result-icon draw" />;
    }
  };

  const getAdjustedColor = (color) => {
    // Always adjust color for dark theme
    // Parse the hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Check if it's a dark color that needs lightening
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness < 128) {
      // For dark colors, increase brightness by 40%
      const factor = 1.4;
      const newR = Math.min(255, Math.floor(r * factor));
      const newG = Math.min(255, Math.floor(g * factor));
      const newB = Math.min(255, Math.floor(b * factor));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    return color;
  };

  const renderStatCard = (title, matches, icon, cardId) => {
    if (!matches || matches.length === 0) return null;
    
    const isHovered = hoveredCard === cardId;

    return (
      <div 
        className={`ts-stat-card ${isHovered ? 'hovered' : ''}`} 
        style={{ 
          borderTop: `4px solid ${getAdjustedColor(selectedTeam.color)}`,
          boxShadow: isHovered ? `0 12px 24px ${getAdjustedColor(selectedTeam.color)}30` : undefined
        }}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="ts-stat-header">
          <div className="ts-stat-icon" style={{ backgroundColor: `${getAdjustedColor(selectedTeam.color)}20`, color: getAdjustedColor(selectedTeam.color) }}>
            {icon}
          </div>
          <h3 style={{ color: '#fff' }}>{title}</h3>
        </div>
        <div className="ts-stat-content">
          {matches.map((match, index) => (
            <div 
              key={`${match.id}-${index}`} 
              className="ts-match-row"
              style={{ 
                borderLeft: isHovered ? `3px solid ${getAdjustedColor(selectedTeam.color)}` : undefined,
                transform: isHovered ? 'translateX(8px) translateZ(5px)' : undefined
              }}
            >
              <div className="ts-match-info">
                <div className="ts-match-date">
                  <Calendar size={14} style={{ color: getAdjustedColor(selectedTeam.color) }} />
                  {formatDate(match.date)}
                </div>
                <div className="ts-match-teams">
                  <div className="ts-team-container">
                    {getResultIndicator(match['home-team'].score, match['away-team'].score, true)}
                  <span className="ts-team-name">{match['home-team'].name}</span>
                  </div>
                  <span className="ts-score" style={{ backgroundColor: `${getAdjustedColor(selectedTeam.color)}20`, color: getAdjustedColor(selectedTeam.color) }}>
                    {match['home-team'].score} - {match['away-team'].score}
                  </span>
                  <div className="ts-team-container">
                  <span className="ts-team-name">{match['away-team'].name}</span>
                    {getResultIndicator(match['home-team'].score, match['away-team'].score, false)}
                  </div>
                </div>
              </div>
              <div className="ts-match-attendance">
                <Users size={14} style={{ color: getAdjustedColor(selectedTeam.color) }} />
                {match.attendance.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSequenceCard = (title, sequences, icon, type, cardId) => {
    if (!sequences) return null;

    const filteredSequences = sequences.sequences.filter(seq => 
      seq.type.toLowerCase() === type.toLowerCase() &&
      seq['time-period'] === 'Current'
    );
    
    const isHovered = hoveredCard === cardId;

    const getTypeIcon = (seqType) => {
      if (seqType.toLowerCase().includes('win')) return <Trophy size={12} className="sequence-type-icon win" />;
      if (seqType.toLowerCase().includes('unbeaten')) return <Star size={12} className="sequence-type-icon unbeaten" />;
      if (seqType.toLowerCase().includes('loss') || seqType.toLowerCase().includes('defeat')) 
        return <TrendingDown size={12} className="sequence-type-icon loss" />;
      return null;
    };

    const getSequenceColor = (seqType) => {
      // Use team color with appropriate opacity
      return `${getAdjustedColor(selectedTeam.color)}90`;
    };

    return (
      <div 
        className={`ts-sequence-card ${isHovered ? 'hovered' : ''}`}
        style={{ 
          borderTop: `4px solid ${getAdjustedColor(selectedTeam.color)}`,
          boxShadow: isHovered ? `0 8px 16px ${getAdjustedColor(selectedTeam.color)}30` : undefined
        }}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="ts-sequence-header">
          <div className="ts-sequence-icon" style={{ backgroundColor: `${getAdjustedColor(selectedTeam.color)}20`, color: getAdjustedColor(selectedTeam.color) }}>
            {icon}
          </div>
          <h3 style={{ color: '#fff' }}>{title}</h3>
        </div>
        <div className="ts-sequence-content">
          {filteredSequences.map((seq, index) => (
            <div 
              key={index} 
              className="ts-sequence-row"
              style={{ 
                borderLeft: isHovered ? `3px solid ${getAdjustedColor(selectedTeam.color)}` : undefined,
                transform: isHovered ? 'translateX(4px) translateZ(2px)' : undefined
              }}
            >
              <div className="ts-sequence-info">
                <span className="ts-sequence-desc">{seq.description}</span>
                <div className="ts-sequence-type-container">
                  {getTypeIcon(seq.type)}
                <span className="ts-sequence-type">{seq.type}</span>
                </div>
              </div>
              <div className="ts-sequence-value" 
                style={{ 
                  backgroundColor: getSequenceColor(seq.type),
                  boxShadow: isHovered ? '0 3px 8px rgba(0, 0, 0, 0.3)' : undefined
                }}
              >
                {seq.matches}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="team-stats">
      <div className="ts-team-selector">
        <div className="ts-header-content">
          <h2>TEAM <span className="ts-blue-text">STATISTICS</span> 24/25</h2>
          <div className="ts-teams-grid">
            <div className="ts-teams-grid-container">
              {TOP_TEAMS.map(team => (
                <div 
                  key={team.id}
                  data-team-id={team.id}
                  className={`ts-team-item ${selectedTeam.id === team.id ? 'active' : ''}`}
                  onClick={() => handleTeamSelect(team.id)}
                  style={{ 
                    borderColor: selectedTeam.id === team.id ? 'transparent' : 'transparent',
                    boxShadow: selectedTeam.id === team.id ? undefined : undefined
                  }}
                >
                  <div className="ts-team-logo-circle" style={{ backgroundColor: 'white' }}>
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="ts-team-select-logo"
                    />
                  </div>
                  <span className="ts-team-select-name">
                    {team.name}
                  </span>
                  {selectedTeam.id === team.id && (
                    <div className="ts-team-active-indicator"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="ts-loading" style={{ borderLeft: `4px solid ${getAdjustedColor(selectedTeam.color)}` }}>
        <RefreshCw size={24} className="loading-icon rotate" style={{ color: getAdjustedColor(selectedTeam.color) }} />
        <p>Loading team statistics...</p>
      </div>}
      
      {error && <div className="ts-error">
        <Info size={24} />
        <p>{error}</p>
        <button onClick={handleRefresh} style={{ backgroundColor: getAdjustedColor(selectedTeam.color) }}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>}
      
      {!loading && !error && (
        <div className="ts-content-container" ref={statsRef}>
          <div className="ts-team-display">
            <div className="ts-logo-display" style={{ borderColor: getAdjustedColor(selectedTeam.color) }}>
              <img 
                src={selectedTeam.logo} 
                alt={selectedTeam.fullName} 
                className="ts-current-team-logo"
              />
            </div>
            <h3 className="ts-current-team-name" style={{ color: '#fff' }}>
              {selectedTeam.fullName}
            </h3>
          </div>
          
          <div className="ts-tabs">
            <button 
              className={`ts-tab ${activeTab === 'sequences' ? 'active' : ''}`} 
              onClick={() => setActiveTab('sequences')}
              style={{ 
                borderBottom: activeTab === 'sequences' ? `3px solid ${getAdjustedColor(selectedTeam.color)}` : undefined,
                color: activeTab === 'sequences' ? getAdjustedColor(selectedTeam.color) : undefined
              }}
            >
              Current Form
            </button>
            <button 
              className={`ts-tab ${activeTab === 'records' ? 'active' : ''}`} 
              onClick={() => setActiveTab('records')}
              style={{ 
                borderBottom: activeTab === 'records' ? `3px solid ${getAdjustedColor(selectedTeam.color)}` : undefined,
                color: activeTab === 'records' ? getAdjustedColor(selectedTeam.color) : undefined
              }}
            >
              Season Records
            </button>
          </div>
          
          {sequences && activeTab === 'sequences' && (
            <div className="ts-sequences-grid">
              {renderSequenceCard("Home Form", sequences, <Shield size={20} color={getAdjustedColor(selectedTeam.color)} />, "Home matches", "home-form")}
              {renderSequenceCard("Away Form", sequences, <Target size={20} color={getAdjustedColor(selectedTeam.color)} />, "Away matches", "away-form")}
              {renderSequenceCard("Overall Form", sequences, <Activity size={20} color={getAdjustedColor(selectedTeam.color)} />, "All matches", "overall-form")}
            </div>
          )}

          {teamStats && activeTab === 'records' && (
        <div className="ts-stats-grid">
          {renderStatCard(
            "Biggest Victories",
            teamStats.records.find(r => r.description === "Biggest Victory" && r.type === "All Matches")?.matches,
                <Award color={getAdjustedColor(selectedTeam.color)} />,
                "victories"
          )}
          {renderStatCard(
            "Heaviest Defeats",
            teamStats.records.find(r => r.description === "Heaviest Defeat" && r.type === "All Matches")?.matches,
                <TrendingUp color={getAdjustedColor(selectedTeam.color)} />,
                "defeats"
          )}
          {renderStatCard(
            "Highest Scoring Matches",
            teamStats.records.find(r => r.description === "Highest Scoring" && r.type === "All Matches")?.matches,
                <Zap color={getAdjustedColor(selectedTeam.color)} />,
                "high-scoring"
          )}
          {renderStatCard(
            "Highest Attendance",
            teamStats.records.find(r => r.description === "Highest Attendance" && r.type === "All Matches")?.matches,
                <Users color={getAdjustedColor(selectedTeam.color)} />,
                "attendance"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamStats;