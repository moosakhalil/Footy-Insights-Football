import React, { useState, useEffect } from 'react';
import { TrendingUp, Tv, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import './Predictions.css';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('seriesA');

  const leagues = [
    { 
      id: 'seriesA', 
      name: 'Serie A', 
      logo: 'https://media.api-sports.io/football/leagues/135.png',
      endpoint: 'seriesA', 
      color: '#1a78cf' 
    },
    { 
      id: 'premierLeague', 
      name: 'Premier League', 
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      endpoint: 'premuire-league', 
      color: '#3D195B' 
    },
    { 
      id: 'laLiga', 
      name: 'La Liga', 
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      endpoint: 'laliga', 
      color: '#ee8707' 
    },
    { 
      id: 'bundesliga', 
      name: 'Bundesliga', 
      logo: 'https://media.api-sports.io/football/leagues/78.png',
      endpoint: 'bundesliga', 
      color: '#d20515' 
    }
  ];

  useEffect(() => {
    const fetchPredictions = async () => {
      const selectedLeagueData = leagues.find(league => league.id === selectedLeague);
      const url = `https://football_api12.p.rapidapi.com/betting/${selectedLeagueData.endpoint}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '49ac784424msheef56e89e5f5466p12a64djsnca1bf499a111',
          'x-rapidapi-host': 'football_api12.p.rapidapi.com'
        }
      };

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }
        const data = await response.json();
        
        // Transform the data to match our needs
        const transformedData = data.filter(item => {
          return item.match && 
                 !item.match.includes('Serie A Predictions') && 
                 !item.match.includes('Premier League Predictions') &&
                 !item.match.includes('La Liga Predictions') &&
                 !item.match.includes('Bundesliga Predictions');
        }).map(item => {
          // Extract match details using regex
          const matchRegex = /Prediction \d+: (.*?) vs (.*?): (.*?) @ (.*)/;
          const matches = item.match.match(matchRegex);
          
          return {
            match: item.match,
            prediction: {
              homeTeam: matches ? matches[1].trim() : '',
              awayTeam: matches ? matches[2].trim() : '',
              predictionType: matches ? matches[3].trim() : '',
              odds: matches ? matches[4].trim() : '',
              description: item.Prediction.Description || '',
              kickOff: item.Prediction['Kick-Off'] || ''
            }
          };
        });
        
        setPredictions(transformedData);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedLeague]);

  const getLeagueTitle = () => {
    const league = leagues.find(l => l.id === selectedLeague);
    return `${league.name} Predictions & Betting Tips`;
  };

  const getLeagueColor = () => {
    const league = leagues.find(l => l.id === selectedLeague);
    return league.color;
  };

  const handleLeagueSelect = (league) => {
    setSelectedLeague(league.id);
  };

  if (loading) {
    return (
      <div className="predictions-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading predictions...
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-container">
      <div className="predictions-header">
        <div className="header-content">
          <div className="league-logo">
            <img 
              src={leagues.find(l => l.id === selectedLeague).logo} 
              alt={`${selectedLeague} logo`}
            />
          </div>
          <h1>{leagues.find(l => l.id === selectedLeague).name} Predictions</h1>
        </div>
        <div className="league-selector">
          {leagues.map((league) => (
            <button
              key={league.name}
              className={`league-selector-btn ${selectedLeague === league.id ? 'active' : ''}`}
              onClick={() => handleLeagueSelect(league)}
            >
              <span className="league-logo-small">
                <img src={league.logo} alt={`${league.name} logo`} />
              </span>
              {league.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="predictions-content">
        {error ? (
          <div className="error">
            <AlertCircle size={24} />
            <p>Error: {error}</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="no-predictions">
            <AlertCircle size={24} />
            <p>No predictions available for {leagues.find(l => l.id === selectedLeague).name}</p>
            <p className="sub-text">Please check back later for updates</p>
          </div>
        ) : (
          <div className="predictions-grid">
            {predictions.map((prediction, index) => (
              <div key={index} className="prediction-card">
                <div className="prediction-header">
                  <Trophy size={20} />
                  <span className="prediction-number">Prediction {index + 1}</span>
                </div>

                <div className="teams-container">
                  <div className="team home">{prediction.prediction.homeTeam}</div>
                  <div className="vs">VS</div>
                  <div className="team away">{prediction.prediction.awayTeam}</div>
                </div>

                <div className="prediction-details">
                  <div className="prediction-stat">
                    <TrendingUp size={16} />
                    <span>Prediction & Odds</span>
                    <div className="predicted-bet">
                      <span className="bet-type">{prediction.prediction.predictionType}</span>
                      <span className="odds">{prediction.prediction.odds}</span>
                    </div>
                  </div>

                  <div className="prediction-description">
                    {prediction.prediction.description}
                  </div>

                  <div className="prediction-broadcast">
                    <Tv size={16} />
                    <span>{prediction.prediction.kickOff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions; 