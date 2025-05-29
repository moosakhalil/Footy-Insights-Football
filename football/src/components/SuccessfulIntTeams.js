import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
import successfulIntTeamsData from '../data/Successful-Int-Teams.json';

const SuccessfulIntTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTeams(successfulIntTeamsData);
    setLoading(false);
  }, []);

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>MOST SUCCESSFUL NATIONAL TEAMS</h1>
      </div>
      <p className="history-description">
        A ranking of the most successful national football teams in World Cup history based on titles won and final appearances.
      </p>
      <div className="history-container">
        {loading ? (
          <p className="text-center p-4">Loading data...</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Nation</th>
                <th>World Cup Titles</th>
                <th>Runner-up Finishes</th>
                <th>Total Finals</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="nationality-cell">
                      {team.flag_url && (
                        <img 
                          src={team.flag_url} 
                          alt={team.nation} 
                          className="country-flag"
                          onError={(e) => { e.target.src = 'https://flagcdn.com/w320/un.png'; }}
                        />
                      )}
                      <span>{team.nation}</span>
                    </div>
                  </td>
                  <td className="text-center">{team.titles}</td>
                  <td className="text-center">{team.runners_up}</td>
                  <td className="text-center"><strong>{team.titles + team.runners_up}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuccessfulIntTeams; 