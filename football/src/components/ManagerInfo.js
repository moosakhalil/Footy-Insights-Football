import React, { useState, useEffect } from "react";
import "./ManagerInfo.css";
import { Search, ArrowLeft, User, Calendar, Flag, MapPin, Award, TrendingUp, Trophy, Briefcase } from 'lucide-react';

const ManagerInfo = () => {
  const [managerName, setManagerName] = useState("");
  const [managerData, setManagerData] = useState(null);
  const [managerImage, setManagerImage] = useState(null);
  const [teamLogo, setTeamLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleSearch = async () => {
    if (!managerName.trim()) {
      return;
    }

    setIsLoading(true);
    setManagerData(null);
    setManagerImage(null);
    setTeamLogo(null);

    // Search for manager
    const searchUrl = `https://sofascore.p.rapidapi.com/managers/search?name=${encodeURIComponent(managerName)}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "ac8abc1111msh676ab332d96cad6p1213bajsnc1b0645ff63c",
        "x-rapidapi-host": "sofascore.p.rapidapi.com",
      },
    };

    try {
      const searchResponse = await fetch(searchUrl, options);
      const searchText = await searchResponse.text();
      const searchResult = JSON.parse(searchText);

      if (searchResult.managers && searchResult.managers.length > 0) {
        const manager = searchResult.managers[0];
        
        // Fetch detailed manager info
        await fetchManagerDetails(manager.id);
        
        // Fetch manager image
        try {
          const imageUrl = `https://sofascore.p.rapidapi.com/managers/get-image?managerId=${manager.id}`;
          const imageResponse = await fetch(imageUrl, options);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            setManagerImage(URL.createObjectURL(imageBlob));
          }
        } catch (err) {
          console.error("Error fetching manager image:", err);
        }

        // Fetch team logo if manager has a team
        if (manager.team?.id) {
          try {
            const teamLogoUrl = `https://sofascore.p.rapidapi.com/teams/get-logo?teamId=${manager.team.id}`;
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
        setManagerData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setManagerData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagerDetails = async (managerId) => {
    try {
      const url = `https://sofascore.p.rapidapi.com/managers/detail?managerId=${managerId}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '6299bf682emsh35a20f918de5943p110b9bjsn5e19c1f55cf8',
          'x-rapidapi-host': 'sofascore.p.rapidapi.com'
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
        console.log('Parsed Manager Details:', data);
        setManagerData(data.manager);
      } catch (parseError) {
        console.error('Error parsing manager details:', parseError);
      }
    } catch (error) {
      console.error('Error fetching manager details:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBack = () => {
    setManagerData(null);
    setManagerImage(null);
    setTeamLogo(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getManagerAge = (timestamp) => {
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

  const formatWinPercentage = (performance) => {
    if (!performance || !performance.total) return "N/A";
    
    const winPercentage = (performance.wins / performance.total) * 100;
    return `${winPercentage.toFixed(2)}%`;
  };

  // Handle Enter key on search input
  useEffect(() => {
    const searchInput = document.querySelector('.manager-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', handleKeyDown);
      return () => {
        searchInput.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [managerName]);

  return (
    <div className="manager-info">
      <div className="manager-search-section">
        <h1 className="manager-title">Footy Insights <span className="manager-white-text">Manager Info</span></h1>
        {!managerData && (
          <div className="manager-search-container">
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="manager-search-input"
              placeholder="Search for a manager..."
            />
            <button onClick={handleSearch} className="manager-search-button">
              {isLoading ? "Searching..." : "Search"}
              {!isLoading && <Search size={18} className="manager-search-icon" />}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="manager-loading">
          <div className="manager-loader"></div>
          <p>Searching for manager information...</p>
        </div>
      )}

      {managerData && (
        <>
          <div className="manager-card">
            <div className="manager-back-arrow" onClick={handleBack}>
              <ArrowLeft size={20} />
            </div>

            {teamLogo && <img src={teamLogo} alt="Team Logo" className="manager-team-logo-top" />}

            <div className="manager-header">
              {managerImage ? (
                <div className="manager-photo">
                  <img src={managerImage} alt={managerData.name} />
                </div>
              ) : (
                <div className="manager-photo manager-photo-placeholder">
                  <User size={64} />
                </div>
              )}
              <div className="manager-header-info">
                <h2 className="manager-name">{managerData.name}</h2>
                {managerData.country && (
                  <p className="manager-nationality">
                    <Flag size={16} /> {managerData.country.name || "N/A"}
                  </p>
                )}
                {managerData.team && (
                  <p className="manager-team">
                    <Briefcase size={16} /> {managerData.team.name || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="manager-tab-navigation">
              <button 
                className={`manager-tab-button ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
              >
                <User size={18} />
                Manager Details
              </button>
              <button 
                className={`manager-tab-button ${activeTab === "performance" ? "active" : ""}`}
                onClick={() => setActiveTab("performance")}
              >
                <TrendingUp size={18} />
                Performance
              </button>
            </div>

            {activeTab === "details" && (
              <div className="manager-details">
                <div className="manager-detail-item">
                  <Calendar size={20} className="manager-detail-icon" />
                  <p>
                    <strong>Age</strong>
                    <span>
                      {managerData.dateOfBirthTimestamp
                        ? getManagerAge(managerData.dateOfBirthTimestamp)
                        : "N/A"}
                    </span>
                  </p>
                </div>
                
                <div className="manager-detail-item">
                  <Flag size={20} className="manager-detail-icon" />
                  <p>
                    <strong>Nationality</strong>
                    <span>{managerData.country?.name || "N/A"}</span>
                  </p>
                </div>
                
                <div className="manager-detail-item">
                  <MapPin size={20} className="manager-detail-icon" />
                  <p>
                    <strong>Current Team</strong>
                    <span>{managerData.team?.name || "N/A"}</span>
                  </p>
                </div>

                <div className="manager-detail-item">
                  <Trophy size={20} className="manager-detail-icon" />
                  <p>
                    <strong>League</strong>
                    <span>{managerData.team?.tournament?.name || "N/A"}</span>
                  </p>
                </div>
                
                <div className="manager-detail-item">
                  <Calendar size={20} className="manager-detail-icon" />
                  <p>
                    <strong>Birth Date</strong>
                    <span>
                      {managerData.dateOfBirthTimestamp
                        ? formatDate(managerData.dateOfBirthTimestamp)
                        : "N/A"}
                    </span>
                  </p>
                </div>

                <div className="manager-detail-item">
                  <Award size={20} className="manager-detail-icon" />
                  <p>
                    <strong>Preferred Formation</strong>
                    <span>{managerData.preferredFormation || "N/A"}</span>
                  </p>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="manager-performance">
                <h3 className="manager-performance-title">Career Statistics</h3>
                
                {!managerData.performance ? (
                  <div className="manager-no-performance">
                    <p>No performance data available for this manager.</p>
                  </div>
                ) : (
                  <div className="manager-performance-stats">
                    <div className="manager-stat-item">
                      <div className="manager-stat-number">{managerData.performance.total || 0}</div>
                      <div className="manager-stat-label">Games</div>
                    </div>
                    
                    <div className="manager-stat-item">
                      <div className="manager-stat-number">{managerData.performance.wins || 0}</div>
                      <div className="manager-stat-label">Wins</div>
                    </div>
                    
                    <div className="manager-stat-item">
                      <div className="manager-stat-number">{managerData.performance.draws || 0}</div>
                      <div className="manager-stat-label">Draws</div>
                    </div>
                    
                    <div className="manager-stat-item">
                      <div className="manager-stat-number">{managerData.performance.losses || 0}</div>
                      <div className="manager-stat-label">Losses</div>
                    </div>
                    
                    <div className="manager-stat-item">
                      <div className="manager-stat-number">{formatWinPercentage(managerData.performance)}</div>
                      <div className="manager-stat-label">Win Rate</div>
                    </div>
                    
                    <div className="manager-stat-item manager-goals">
                      <div className="manager-goals-stats">
                        <div className="manager-goals-for">
                          <span className="manager-goals-number">{managerData.performance.goalsScored || 0}</span>
                          <span className="manager-goals-label">Goals For</span>
                        </div>
                        <div className="manager-goals-separator">:</div>
                        <div className="manager-goals-against">
                          <span className="manager-goals-number">{managerData.performance.goalsConceded || 0}</span>
                          <span className="manager-goals-label">Goals Against</span>
                        </div>
                      </div>
                      <div className="manager-stat-label">Goal Record</div>
                    </div>
                    
                    <div className="manager-stat-item">
                      <div className="manager-stat-number">{managerData.performance.totalPoints || 0}</div>
                      <div className="manager-stat-label">Total Points</div>
                    </div>
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

export default ManagerInfo; 