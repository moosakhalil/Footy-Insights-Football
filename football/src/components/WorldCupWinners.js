import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
import worldCupData from '../data/worldcup-winners.json';

const WorldCupWinners = () => {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    setWinners(worldCupData);
  }, []);

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>WORLD CUP WINNERS</h1>
      </div>
      <p className="history-description">Complete list of all FIFA World Cup winners throughout history.</p>
      <div className="history-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Winner</th>
              <th>Runner-up</th>
              <th>Score</th>
              <th>Host</th>
              <th>Venue</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((winner) => (
              <tr key={winner.year}>
                <td>{winner.year}</td>
                <td>
                  <div className="winner-cell">
                    {winner.winner_image && <img src={winner.winner_image} alt={winner.winner} className="country-flag" />}
                    <span>{winner.winner}</span>
                  </div>
                </td>
                <td>
                  <div className="runner-up-cell">
                    {winner.runner_up_image && <img src={winner.runner_up_image} alt={winner.runner_up} className="country-flag" />}
                    <span>{winner.runner_up}</span>
                  </div>
                </td>
                <td>{winner.score}</td>
                <td>
                  <div className="winner-cell">
                    {winner.winner_image && (
                      <img 
                        src={getHostFlag(winner.host, winner.winner_image, winner.runner_up_image)} 
                        alt={winner.host} 
                        className="country-flag" 
                      />
                    )}
                    <span>{winner.host}</span>
                  </div>
                </td>
                <td>{winner.venue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to determine host country flag
const getHostFlag = (host, winnerFlag, runnerUpFlag) => {
  // For hosts that are also the winner or runner-up, use their existing flag
  if (host.includes('England') || host.includes('Great Britain')) {
    return "https://flagcdn.com/w320/gb-eng.png";
  } else if (host.includes('West Germany')) {
    return "https://flagcdn.com/w320/de.png";
  } else if (host === "Japan & South Korea") {
    return "https://flagcdn.com/w320/jp.png"; // Using Japan as default
  } else if (host.includes('Soviet Union')) {
    return "https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_the_Soviet_Union.svg";
  } else if (host.includes('Czechoslovakia')) {
    return "https://flagcdn.com/w320/cz.png";
  }
  
  // Try to match host with winner or runner-up
  const hostLower = host.toLowerCase();
  const matchWinner = winnerFlag && hostLower.includes(winnerFlag.split('/').pop().split('.')[0].split('-')[1]);
  const matchRunner = runnerUpFlag && hostLower.includes(runnerUpFlag.split('/').pop().split('.')[0].split('-')[1]);
  
  if (matchWinner) return winnerFlag;
  if (matchRunner) return runnerUpFlag;
  
  // Default flag pattern for countries
  return `https://flagcdn.com/w320/${getCountryCode(host)}.png`;
};

// Get country code for flag CDN
const getCountryCode = (country) => {
  const codes = {
    'Qatar': 'qa',
    'Russia': 'ru',
    'Brazil': 'br',
    'South Africa': 'za',
    'Germany': 'de',
    'Japan & South Korea': 'jp', // Default to Japan
    'France': 'fr',
    'USA': 'us',
    'Italy': 'it',
    'Mexico': 'mx',
    'Argentina': 'ar',
    'Spain': 'es',
    'Sweden': 'se',
    'Switzerland': 'ch',
    'Uruguay': 'uy',
    'Chile': 'cl'
  };
  
  return codes[country] || 'un'; // Return country code or UN flag as fallback
};

export default WorldCupWinners; 