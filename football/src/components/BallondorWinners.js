import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
// Import data directly - assuming ballondor-winners.json is properly configured in your project
import ballondorData from '../data/ballondor-winners.json';

const BallondorWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Sort winners by year in descending order (most recent first)
      const sortedData = [...ballondorData].sort((a, b) => b.year - a.year);
      
      // Filter out entries with empty player names
      const filteredData = sortedData.filter(winner => winner.player && winner.player !== "");
      
      setWinners(filteredData);
    } catch (error) {
      console.error("Error processing Ballon d'Or data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fix image paths by removing "/public" prefix if it exists
  const getCorrectImagePath = (path) => {
    if (!path) return null;
    return path.replace('/public', '');
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>BALLON D'OR WINNERS</h1>
      </div>
      <p className="history-description">
        The Ballon d'Or is an annual football award presented by French news magazine France Football. 
        It is one of the oldest and most prestigious individual awards for football players.
      </p>
      
      <div className="history-container">
        {loading ? (
          <p className="text-center p-4">Loading data...</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Player</th>
                <th>Nationality</th>
                <th>Club</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner) => (
                <tr key={winner.year}>
                  <td>{winner.year}</td>
                  <td>
                    <div className="player-name-cell">
                      <span>{winner.player}</span>
                    </div>
                  </td>
                  <td>
                    <div className="nationality-cell">
                      {winner.flag_image && (
                        <img 
                          src={getCorrectImagePath(winner.flag_image)} 
                          alt={winner.nationality} 
                          className="country-flag"
                          onError={(e) => {
                            e.target.src = '/images/un-flag.png';
                          }}
                        />
                      )}
                      <span>{winner.nationality}</span>
                    </div>
                  </td>
                  <td>
                    <div className="club-cell">
                      {winner.club_logo && (
                        <img 
                          src={getCorrectImagePath(winner.club_logo)} 
                          alt={winner.club} 
                          className="club-logo" 
                          onError={(e) => {
                            e.target.src = '/images/default-club.png';
                          }}
                        />
                      )}
                      <span>{winner.club}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BallondorWinners;