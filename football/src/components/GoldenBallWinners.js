import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
import goldenBallData from '../data/golden-ball-winners.json';

const GoldenBallWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No need for complex mapping, just use the data directly
    setWinners(goldenBallData);
    setLoading(false);
  }, []);

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>GOLDEN BALL WINNERS</h1>
      </div>
      <p className="history-description">
        The Golden Ball is awarded to the best player of the FIFA World Cup tournament.
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
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner) => (
                <tr key={winner.year}>
                  <td>{winner.year}</td>
                  <td>
                    <div className="player-name-cell">
                      <img
                        src={winner.player_image}
                        alt={winner.winner}
                        className="player-image"
                        onError={(e) => {
                          e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                        }}
                      />
                      <span>{winner.winner}</span>
                    </div>
                  </td>
                  <td>
                    <div className="nationality-cell">
                      <img
                        src={winner.country_flag}
                        alt={winner.country}
                        className="country-flag"
                        onError={(e) => {
                          e.target.src = 'https://flagcdn.com/w320/un.png';
                        }}
                      />
                      <span>{winner.country}</span>
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

export default GoldenBallWinners;