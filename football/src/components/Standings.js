import React, { useEffect, useState } from 'react';
import "./Standings.css";

// League Data
const leagues = [
  { name: 'Premier League', code: 'england', id: 'premier-league', icon: '/images/PL.png' },
  { name: 'LaLiga', code: 'spain', id: 'laliga', icon: '/images/Laliga.png' },
  { name: 'Serie A', code: 'italy', id: 'serie-a', icon: '/images/seriea.png' },
  { name: 'Bundesliga', code: 'germany', id: 'bundesliga', icon: '/images/bundesliga.png' },
  { name: 'Ligue 1', code: 'france', id: 'ligue-1', icon: '/images/ligue1.png' },
  { name: 'Turkish Süper Lig', code: 'turkey', id: 'super-lig', icon: '/images/turk.png' },
  { name: 'A-League', code: 'australia', id: 'a-league', icon: '/images/A.png' },
  { name: 'Liga BBVA MX Clausura', code: 'mexico', id: 'liga-mx-clausura', icon: '/images/liga.png' },
  { name: 'A Lyga', code: 'lithuania', id: 'a-lyga', icon: '/images/Aly.png' },
  { name: 'Campeonato Baiano', code: 'brazil', id: 'baiano', icon: '/images/biano.png' },
  { name: 'Indian Super League', code: 'india', id: 'indian-super-league', icon: '/images/isl.png' },
  { name: 'Belgian Pro League', code: 'belgium', id: 'belgian-pro-league', icon: '/images/belgi.png' },
  { name: 'Portuguese Primeira Liga', code: 'portugal', id: 'primeira-liga', icon: '/images/portugal.png' },
];

const Standings = () => {
  const [selectedLeague, setSelectedLeague] = useState('premier-league'); // Default league
  const [standings, setStandings] = useState([]); // Store standings data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchStandings = async () => {
      const league = leagues.find(l => l.id === selectedLeague);
      if (!league) return;

      setLoading(true);
      setError(null);
      setStandings([]);

      const url = `https://livescore6.p.rapidapi.com/leagues/v2/get-table?Category=soccer&Ccd=${league.code}&Scd=${league.id}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'a21e08a9a5msh18b5ba021522bc3p12728ejsndc4f48fdadca',
          'x-rapidapi-host': 'livescore6.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options);
        
        // Check HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const text = await response.text();

        // Check for empty response
        if (!text) {
          throw new Error("API returned an empty response");
        }

        const data = JSON.parse(text);
        console.log("API Response:", data); // Debugging

        // Extract standings (handling variations in API response structure)
        const leagueTable = data.LeagueTable?.L?.[0]?.Tables?.[0]?.team || [];

        setStandings(leagueTable);
      } catch (error) {
        console.error("Error fetching standings:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [selectedLeague]);

  const currentLeague = leagues.find((l) => l.id === selectedLeague);
  
  // Function to construct team logo URL from the Img field
  const getTeamLogoUrl = (imgPath) => {
    if (!imgPath) return null;
    
    // Based on the example response, we need to construct the URL properly
    // The Img field contains paths like "enet/10204.png"
    // We need to determine the base URL for these images
    
    // Option 1: If the API is hosting the images
    // return `https://livescore6.p.rapidapi.com/${imgPath}`;
    
    // Option 2: If images come from a CDN
    return `https://lsm-static-prod.livescore.com/medium/${imgPath}`;
    
    // Try different base URLs if the above doesn't work
  };

  // Generate a colored initial for teams without logos
  const getTeamInitial = (teamName) => {
    return teamName ? teamName.charAt(0) : '?';
  };

  return (
    <div className="standings-container">
      {/* Sidebar for League Selection */}
      <div className="standings-sidebar">
        <div className="standings-sidebar-title">Leagues</div>
        {leagues.map((league) => (
          <div
            key={league.id}
            className={`standings-league-item ${selectedLeague === league.id ? 'active' : ''}`}
            onClick={() => setSelectedLeague(league.id)}
          >
            <img src={league.icon} alt={league.name} className="standings-league-icon" />
            {league.name}
          </div>
        ))}
      </div>

      {/* Main Standings Content */}
      <div className="standings-content">
        <div className="standings-league-header">
          {currentLeague && <img src={currentLeague.icon} alt={currentLeague.name} className="standings-league-header-icon" />}
          <h2 className="standings-heading">{currentLeague?.name} Standings</h2>
        </div>

        {loading ? (
          <div className="standings-loading">Loading standings...</div>
        ) : error ? (
          <div className="standings-error">Error: {error}</div>
        ) : standings.length === 0 ? (
          <div className="standings-error">No standings available.</div>
        ) : (
          <table className="standings-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th className="standings-team-column-header">Team</th>
                <th>MP</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr key={index} className={index < 4 ? 'champions-league' : (index >= standings.length - 3 ? 'relegation' : '')}>
                  <td className="standings-position">{team.rnk}</td>
                  <td className="standings-team-cell">
                    <div className="standings-team-logo-container">
                      {/* Try to load the logo image */}
                      {team.Img && (
                        <img 
                          src={getTeamLogoUrl(team.Img)} 
                          alt={team.Tnm} 
                          className="standings-team-logo" 
                          onError={(e) => {
                            // If image fails, hide it and show initials
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      {/* Fallback to team initials */}
                      <div className="standings-team-initials" style={{
                        display: team.Img ? 'none' : 'flex'
                      }}>
                        {getTeamInitial(team.Tnm)}
                      </div>
                    </div>
                    <div className="standings-team-name">{team.Tnm}</div>
                  </td>
                  <td>{team.pld}</td>
                  <td>{team.win}</td>
                  <td>{team.drw}</td>
                  <td>{team.lst}</td>
                  <td>{team.gf}</td>
                  <td>{team.ga}</td>
                  <td>{team.gd}</td>
                  <td className="standings-points">{team.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Standings;