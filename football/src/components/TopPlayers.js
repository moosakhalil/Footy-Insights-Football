import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
import topPlayersData from '../data/top-players.json';

const TopPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 20;

  useEffect(() => {
    setPlayers(topPlayersData);
  }, []);

  // Get current players for pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>TOP 100 PLAYERS</h1>
      </div>
      <p className="history-description">
        The definitive ranking of the top 100 football players of all time, based on talent, achievements, and impact on the game.
      </p>
      
      <div className="history-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Nationality</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {currentPlayers.map((player) => (
              <tr key={player.ranking}>
                <td>{player.ranking}</td>
                <td>
                  <div className="player-name-cell">
                    <span>{player.player}</span>
                  </div>
                </td>
                <td>
                  <div className="nationality-cell">
                    {player.country_flag && (
                      <img 
                        src={player.country_flag.url} 
                        alt={player.national_teams.join(', ')} 
                        className="country-flag" 
                      />
                    )}
                    <span>{player.national_teams.join(', ')}</span>
                  </div>
                </td>
                <td>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: Math.ceil(players.length / playersPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPlayers; 