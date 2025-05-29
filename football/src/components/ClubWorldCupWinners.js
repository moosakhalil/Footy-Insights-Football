import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
import clubWorldCupData from '../data/Club-WC-winnwes.json';

const ClubWorldCupWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use data imported from the JSON file
    setWinners(clubWorldCupData);
    setLoading(false);
  }, []);

  // Fix image paths by removing "/public" prefix if it exists
  const getCorrectImagePath = (path) => {
    return path.replace('/public', '');
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>CLUB WORLD CUP WINNERS</h1>
      </div>
      <p className="history-description">
        The FIFA Club World Cup is an international men's association football competition organized by FIFA, the sport's global governing body. 
        The tournament brings together the champion clubs from each of the six continental confederations.
      </p>
      <div className="history-container">
        {loading ? (
          <p className="text-center p-4">Loading data...</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Winner</th>
                <th>Score</th>
                <th>Runner-up</th>
              </tr>
            </thead>
            <tbody>
              {winners.filter(winner => winner.winning_club !== "").map((winner) => (
                <tr key={winner.season}>
                  <td>{winner.season}</td>
                  <td>
                    <div className="club-cell">
                      <img 
                        src={getCorrectImagePath(winner.winning_club_image)} 
                        alt={winner.winning_club} 
                        className="club-logo"
                        onError={(e) => { e.target.src = "/images/ball.jpg"; }}
                      />
                      <span>{winner.winning_club}</span>
                    </div>
                  </td>
                  <td>{winner.score}</td>
                  <td>
                    <div className="club-cell">
                      <img 
                        src={getCorrectImagePath(winner.runner_up_image)} 
                        alt={winner.runner_up} 
                        className="club-logo"
                        onError={(e) => { e.target.src = "/images/ball.jpg"; }}
                      />
                      <span>{winner.runner_up}</span>
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

export default ClubWorldCupWinners;