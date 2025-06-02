import React, { useState, useEffect } from "react";
import "./PlayerInfo.css";
import { Search, ArrowLeft, User, Calendar, Shirt, Flag, MapPin, DollarSign, Clock, Info, BarChart2, Trophy, Repeat } from 'lucide-react';

const PlayerInfo = () => {
  const [playerName, setPlayerName] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [playerImage, setPlayerImage] = useState(null);
  const [playerAttributes, setPlayerAttributes] = useState(null);
  const [teamLogo, setTeamLogo] = useState(null);
  const [transferHistory, setTransferHistory] = useState(null);
  const [teamLogos, setTeamLogos] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const fetchPlayerDetails = async (playerId) => {
    try {
      const url = `https://divanscore.p.rapidapi.com/players/detail?playerId=${playerId}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '2aed715726msh246888ec46b9077p1e6798jsndd24f623590e',
          'x-rapidapi-host': 'divanscore.p.rapidapi.com'
        }
      };

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.text();
      console.log('Raw API Response:', rawData);
      
      try {
        const data = JSON.parse(rawData);
        console.log('Parsed Player Details:', data);
        
        const details = {
          dateOfBirthTimestamp: data.player?.dateOfBirthTimestamp || null,
          contractUntilTimestamp: data.player?.contractUntilTimestamp || null,
          proposedMarketValue: data.player?.proposedMarketValue || null,
          tournament: data.player?.team?.tournament || null
        };
        
        console.log('Extracted Details:', details);
        setAdditionalDetails(details);
      } catch (parseError) {
        console.error('Error parsing player details:', parseError);
      }
    } catch (error) {
      console.error('Error fetching player details:', error);
    }
  };

  const fetchTransferHistory = async (playerId) => {
    try {
      const url = `https://divanscore.p.rapidapi.com/players/get-transfer-history?playerId=${playerId}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '2aed715726msh246888ec46b9077p1e6798jsndd24f623590e',
          'x-rapidapi-host': 'divanscore.p.rapidapi.com'
        }
      };
      
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.text();
      console.log('Raw Transfer History Response:', rawData);
      
      try {
        const data = JSON.parse(rawData);
        console.log('Parsed Transfer History:', data);
        setTransferHistory(data.transferHistory || []);
        
        // Fetch team logos for all teams in transfer history
        if (data.transferHistory && data.transferHistory.length > 0) {
          const teamIds = new Set();
          data.transferHistory.forEach(transfer => {
            if (transfer.transferFrom?.id) teamIds.add(transfer.transferFrom.id);
            if (transfer.transferTo?.id) teamIds.add(transfer.transferTo.id);
          });
          
          fetchTeamLogos(Array.from(teamIds));
        }
      } catch (parseError) {
        console.error('Error parsing transfer history:', parseError);
      }
    } catch (error) {
      console.error('Error fetching transfer history:', error);
    }
  };
  
  const fetchTeamLogos = async (teamIds) => {
    const logos = { ...teamLogos };
    
    for (const teamId of teamIds) {
      if (logos[teamId]) continue; // Skip if we already have this logo
      
      try {
        const url = `https://divanscore.p.rapidapi.com/teams/get-logo?teamId=${teamId}`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '2aed715726msh246888ec46b9077p1e6798jsndd24f623590e',
            'x-rapidapi-host': 'divanscore.p.rapidapi.com'
          }
        };
        
        const response = await fetch(url, options);
        if (response.ok) {
          const logoBlob = await response.blob();
          logos[teamId] = URL.createObjectURL(logoBlob);
        }
      } catch (error) {
        console.error(`Error fetching logo for team ${teamId}:`, error);
      }
    }
    
    setTeamLogos(logos);
  };

  const handleSearch = async () => {
    if (!playerName.trim()) {
      return;
    }

    setIsLoading(true);
    setPlayerData(null);
    setPlayerImage(null);
    setPlayerAttributes(null);
    setTeamLogo(null);
    setTransferHistory(null);
    setTeamLogos({});
    setAdditionalDetails(null);

    const searchUrl = `https://divanscore.p.rapidapi.com/players/search?name=${encodeURIComponent(playerName)}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "2aed715726msh246888ec46b9077p1e6798jsndd24f623590e ",
        "x-rapidapi-host": "divanscore.p.rapidapi.com",
      },
    };

    try {
      const searchResponse = await fetch(searchUrl, options);
      const searchResult = await searchResponse.json();

      if (searchResult.players && searchResult.players.length > 0) {
        const player = searchResult.players[0];
        setPlayerData(player);
        
        // Fetch additional player details
        fetchPlayerDetails(player.id);
        
        // Fetch transfer history
        fetchTransferHistory(player.id);
        
        // Fetch player image
        try {
          const imageUrl = `https://divanscore.p.rapidapi.com/players/get-image?playerId=${player.id}`;
          const imageResponse = await fetch(imageUrl, options);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            setPlayerImage(URL.createObjectURL(imageBlob));
          }
        } catch (err) {
          console.error("Error fetching player image:", err);
        }

        // Fetch player attributes
        try {
          const attributesUrl = `https://divanscore.p.rapidapi.com/players/get-attribute-overviews?playerId=${player.id}`;
          const attributesResponse = await fetch(attributesUrl, options);
          const attributesResult = await attributesResponse.json();
          setPlayerAttributes(attributesResult.averageAttributeOverviews?.[0] || null);
        } catch (err) {
          console.error("Error fetching player attributes:", err);
        }

        // Fetch team logo
        if (player.team?.id) {
          try {
            const teamLogoUrl = `https://divanscore.p.rapidapi.com/teams/get-logo?teamId=${player.team.id}`;
            const teamLogoResponse = await fetch(teamLogoUrl, options);
            if (teamLogoResponse.ok) {
              const teamLogoBlob = await teamLogoResponse.blob();
              setTeamLogo(URL.createObjectURL(teamLogoBlob));
            }
          } catch (err) {
            console.error("Error fetching team logo:", err);
          }
        }
      } else {
        setPlayerData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setPlayerData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBack = () => {
    setPlayerData(null);
    setPlayerImage(null);
    setPlayerAttributes(null);
    setTeamLogo(null);
    setTransferHistory(null);
    setTeamLogos({});
  };

  const formatPlayerPosition = (position) => {
    if (!position) return "N/A";
    
    // Format position more professionally
    const positionMap = {
      "G": "Goalkeeper",
      "D": "Defender",
      "M": "Midfielder",
      "F": "Forward"
    };
    
    // Check if position has a specific mapping
    if (positionMap[position]) {
      return positionMap[position];
    }
    
    // Otherwise return the original position
    return position;
  };

  const getPlayerAge = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const birthDate = new Date(timestamp * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMarketValue = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTransferType = (type) => {
    switch (type) {
      case 1: return "Loan";
      case 2: return "End of Loan";
      case 3: return "Transfer";
      default: return "Unknown";
    }
  };
  
  const formatTransferFee = (fee, description) => {
    if (!fee && !description) {
      return "Undisclosed";
    }
    
    if (fee === 0 && description) {
      return "Undisclosed";
    }
    
    if (fee > 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(fee);
    }
    
    return "Undisclosed";
  };

  // Handle Enter key on search input
  useEffect(() => {
    const searchInput = document.querySelector('.playerinfo-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', handleKeyDown);
      return () => {
        searchInput.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [playerName]);

  return (
    <div className="playerinfo-container">
      <div className="playerinfo-search-section">
        <h1 className="playerinfo-title">Footy Insights <span className="playerinfo-white-text">Player Info</span></h1>
        {!playerData && (
          <div className="playerinfo-search-container">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="playerinfo-search-input"
              placeholder="Search for a player..."
            />
            <button onClick={handleSearch} className="playerinfo-search-button">
              {isLoading ? "Searching..." : "Search"}
              {!isLoading && <Search size={18} className="playerinfo-search-icon" />}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="playerinfo-loading">
          <div className="playerinfo-loader"></div>
          <p>Searching for player information...</p>
        </div>
      )}

      {playerData && (
        <>
          <div className="playerinfo-card">
            <div className="playerinfo-back-arrow" onClick={handleBack}>
              <ArrowLeft size={20} />
            </div>

            {teamLogo && <img src={teamLogo} alt="Team Logo" className="playerinfo-team-logo-top" />}

            <div className="playerinfo-header">
              {playerImage ? (
                <div className="playerinfo-photo">
                  <img src={playerImage} alt={playerData.name} />
                </div>
              ) : (
                <div className="playerinfo-photo playerinfo-photo-placeholder">
                  <User size={64} />
                </div>
              )}
              <div className="playerinfo-header-info">
                <h2 className="playerinfo-name">{playerData.name}</h2>
                <p className="playerinfo-position">{formatPlayerPosition(playerData.position)}</p>
                {playerData.nationality && (
                  <p className="playerinfo-nationality">
                    <Flag size={16} /> {playerData.nationality.name || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="playerinfo-tab-navigation">
              <button 
                className={`playerinfo-tab-button ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
              >
                <Info size={18} />
                Player Details
              </button>
              <button 
                className={`playerinfo-tab-button ${activeTab === "attributes" ? "active" : ""}`}
                onClick={() => setActiveTab("attributes")}
              >
                <BarChart2 size={18} />
                Player Attributes
              </button>
              <button 
                className={`playerinfo-tab-button ${activeTab === "transfers" ? "active" : ""}`}
                onClick={() => setActiveTab("transfers")}
              >
                <Repeat size={18} />
                Transfer History
              </button>
            </div>

            {activeTab === "details" && (
            <div className="playerinfo-details">
              <div className="playerinfo-detail-item">
                <Calendar size={20} className="playerinfo-detail-icon" />
                <p>
                    <strong>Age</strong>
                    <span>
                      {playerData.dateOfBirthTimestamp
                    ? getPlayerAge(playerData.dateOfBirthTimestamp)
                        : additionalDetails?.dateOfBirthTimestamp 
                          ? getPlayerAge(additionalDetails.dateOfBirthTimestamp)
                    : "N/A"}
                    </span>
                </p>
              </div>
              
              <div className="playerinfo-detail-item">
                <Shirt size={20} className="playerinfo-detail-icon" />
                  <p>
                    <strong>Jersey Number</strong>
                    <span>{playerData.jerseyNumber || "N/A"}</span>
                  </p>
              </div>
              
              <div className="playerinfo-detail-item">
                <MapPin size={20} className="playerinfo-detail-icon" />
                  <p>
                    <strong>Team</strong>
                    <span>{playerData.team?.name || "N/A"}</span>
                  </p>
                </div>

                <div className="playerinfo-detail-item">
                  <Trophy size={20} className="playerinfo-detail-icon" />
                  <p>
                    <strong>League</strong>
                    <span>{additionalDetails?.tournament?.name || playerData.team?.tournament?.name || "N/A"}</span>
                  </p>
              </div>
              
              <div className="playerinfo-detail-item">
                <Calendar size={20} className="playerinfo-detail-icon" />
                <p>
                    <strong>Birth Date</strong>
                    <span>
                  {playerData.dateOfBirthTimestamp
                        ? formatDate(playerData.dateOfBirthTimestamp)
                        : additionalDetails?.dateOfBirthTimestamp
                          ? formatDate(additionalDetails.dateOfBirthTimestamp)
                          : "N/A"}
                    </span>
                  </p>
                </div>

                <div className="playerinfo-detail-item">
                  <Clock size={20} className="playerinfo-detail-icon" />
                  <p>
                    <strong>Contract Until</strong>
                    <span>
                      {additionalDetails?.contractUntilTimestamp
                        ? formatDate(additionalDetails.contractUntilTimestamp)
                        : "N/A"}
                    </span>
                  </p>
                </div>

                <div className="playerinfo-detail-item">
                  <DollarSign size={20} className="playerinfo-detail-icon" />
                  <p>
                    <strong>Market Value</strong>
                    <span>
                      {additionalDetails?.proposedMarketValue
                        ? formatMarketValue(additionalDetails.proposedMarketValue)
                    : "N/A"}
                    </span>
                </p>
              </div>
            </div>
            )}

            {activeTab === "attributes" && (
            <div className="playerinfo-stats">
              <div className="playerinfo-stat-box">
                <div className="playerinfo-stat-icon">⚡</div>
                <span className="playerinfo-stat-label">PACE</span>
                <div className="playerinfo-stat-bar-container">
                  <div 
                    className="playerinfo-stat-bar" 
                    style={{ width: `${playerAttributes?.attacking || 0}%` }}
                  ></div>
                </div>
                <span className="playerinfo-stat-value">{playerAttributes?.attacking || "N/A"}</span>
              </div>
              
              <div className="playerinfo-stat-box">
                <div className="playerinfo-stat-icon">🎯</div>
                <span className="playerinfo-stat-label">SHOOTING</span>
                <div className="playerinfo-stat-bar-container">
                  <div 
                    className="playerinfo-stat-bar" 
                    style={{ width: `${playerAttributes?.technical || 0}%` }}
                  ></div>
                </div>
                <span className="playerinfo-stat-value">{playerAttributes?.technical || "N/A"}</span>
              </div>
              
              <div className="playerinfo-stat-box">
                <div className="playerinfo-stat-icon">🎮</div>
                <span className="playerinfo-stat-label">PASSING</span>
                <div className="playerinfo-stat-bar-container">
                  <div 
                    className="playerinfo-stat-bar" 
                    style={{ width: `${playerAttributes?.tactical || 0}%` }}
                  ></div>
                </div>
                <span className="playerinfo-stat-value">{playerAttributes?.tactical || "N/A"}</span>
              </div>
              
              <div className="playerinfo-stat-box">
                <div className="playerinfo-stat-icon">⚔️</div>
                <span className="playerinfo-stat-label">DRIBBLING</span>
                <div className="playerinfo-stat-bar-container">
                  <div 
                    className="playerinfo-stat-bar" 
                    style={{ width: `${playerAttributes?.defending || 0}%` }}
                  ></div>
                </div>
                <span className="playerinfo-stat-value">{playerAttributes?.defending || "N/A"}</span>
              </div>
              
              <div className="playerinfo-stat-box">
                <div className="playerinfo-stat-icon">🛡️</div>
                <span className="playerinfo-stat-label">DEFENDING</span>
                <div className="playerinfo-stat-bar-container">
                  <div 
                    className="playerinfo-stat-bar" 
                    style={{ width: `${playerAttributes?.creativity || 0}%` }}
                  ></div>
                </div>
                <span className="playerinfo-stat-value">{playerAttributes?.creativity || "N/A"}</span>
              </div>
            </div>
            )}

            {activeTab === "transfers" && (
              <div className="playerinfo-transfer-history">
                <h3 className="playerinfo-transfer-title">Transfer History</h3>
                
                {!transferHistory ? (
                  <div className="playerinfo-loading-transfers">
                    <div className="playerinfo-loader"></div>
                    <p>Loading transfer history...</p>
                  </div>
                ) : transferHistory.length === 0 ? (
                  <div className="playerinfo-no-transfers">
                    <p>No transfer history available for this player.</p>
                  </div>
                ) : (
                  <div className="playerinfo-transfer-table-container">
                    <table className="playerinfo-transfer-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>From</th>
                          <th>To</th>
                          <th style={{ textAlign: 'right' }}>Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferHistory.map((transfer, index) => (
                          <tr key={index} className="playerinfo-transfer-row">
                            <td className="playerinfo-transfer-date">
                              {formatDate(transfer.transferDateTimestamp)}
                            </td>
                            <td className="playerinfo-transfer-type">
                              <span className={`playerinfo-type-badge playerinfo-type-${transfer.type}`}>
                                {formatTransferType(transfer.type)}
                              </span>
                            </td>
                            <td className="playerinfo-transfer-team playerinfo-from-team">
                              <div className="playerinfo-team-content">
                                {teamLogos[transfer.transferFrom?.id] && (
                                  <img 
                                    src={teamLogos[transfer.transferFrom.id]} 
                                    alt={transfer.fromTeamName} 
                                    className="playerinfo-team-logo-small"
                                  />
                                )}
                                <span className="playerinfo-team-name">{transfer.fromTeamName || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="playerinfo-transfer-team playerinfo-to-team">
                              <div className="playerinfo-team-content">
                                {teamLogos[transfer.transferTo?.id] && (
                                  <img 
                                    src={teamLogos[transfer.transferTo.id]} 
                                    alt={transfer.toTeamName} 
                                    className="playerinfo-team-logo-small"
                                  />
                                )}
                                <span className="playerinfo-team-name">{transfer.toTeamName || "Unknown"}</span>
                              </div>
                            </td>
                            <td className={`playerinfo-transfer-fee ${!transfer.transferFee ? 'undisclosed' : ''}`}>
                              {formatTransferFee(transfer.transferFee, transfer.transferFeeDescription)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerInfo;