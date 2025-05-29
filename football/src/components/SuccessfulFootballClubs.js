import React, { useState, useEffect } from 'react';
import '../styles/HistoryPage.css';
import successfulClubsData from '../data/Success-Football-Club.json';

const SuccessfulFootballClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix for data structure - the JSON has a 'clubs' property
    setClubs(successfulClubsData.clubs || []);
    setLoading(false);
  }, []);

  // Function to convert relative paths to public folder paths
  const getPublicImagePath = (relativePath) => {
    if (!relativePath) return null;
    
    // If the path already starts with http or https, it's an external URL
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    
    // For club logos in public/clubs directory, just use the path directly
    // This works because files in public folder are served at the root path
    return relativePath;
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>MOST SUCCESSFUL FOOTBALL CLUBS</h1>
      </div>
      <p className="history-description">
        A comprehensive ranking of the most successful football clubs in history, based on their total number of trophies won
        in domestic and international competitions.
      </p>
      <div className="history-container">
        {loading ? (
          <p className="text-center p-4">Loading data...</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Club</th>
                <th>Country</th>
                <th>Founded</th>
                <th>Total Trophies</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.rank}>
                  <td>{club.rank}</td>
                  <td>
                    <div className="club-cell">
                      {club.club_logo && (
                        <img
                          src={getPublicImagePath(club.club_logo)}
                          alt={club.club}
                          className="club-logo"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span>{club.club}</span>
                    </div>
                  </td>
                  <td>
                    <div className="nationality-cell">
                      {club.country_flag && (
                        <img
                          src={getPublicImagePath(club.country_flag)}
                          alt={club.country}
                          className="country-flag"
                          onError={(e) => { 
                            // Fallback to a default flag image if the flag doesn't load
                            e.target.src = '/flags/un.png'; 
                          }}
                        />
                      )}
                      <span>{club.country}</span>
                    </div>
                  </td>
                  <td>{club.founded}</td>
                  <td><strong>{club.trophies_won}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuccessfulFootballClubs;