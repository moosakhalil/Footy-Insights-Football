import React, { useState, useEffect } from 'react';
import './Videos.css';
import { Play, Calendar, Clock, X, ExternalLink } from 'lucide-react';

const VideoModal = ({ video, isOpen, onClose }) => {
  if (!isOpen || !video) return null;

  // Extract direct video URL from the embed code
  const getDirectVideoUrl = (video) => {
    if (video.embed && typeof video.embed === 'string') {
      const match = video.embed.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        const baseUrl = match[1].split('?')[0];
        return `${baseUrl}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`;
      }
    }
    return '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-container" onClick={e => e.stopPropagation()}>
        <div className="video-modal-header">
          <h3>{video.title}</h3>
          <button className="video-modal-action-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <div className="video-modal-wrapper">
          <iframe
            src={getDirectVideoUrl(video)}
            title={video.title}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        </div>
        
        <div className="video-modal-footer">
          <div className="video-modal-meta-info">
            <span className="video-modal-date">
              <Calendar size={16} />
              {formatDate(video.date)}
            </span>
            <span className="video-modal-competition">
              {video.competition?.name || 'Football Match'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      const url = 'https://free-football-soccer-videos.p.rapidapi.com/';
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'e80515d439msha47810192b4fb37p10f06ejsn98dcefbf4aaf',
          'x-rapidapi-host': 'free-football-soccer-videos.p.rapidapi.com'
        }
      };

      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        
        // Filter out videos without thumbnails or essential data
        const validVideos = data.filter(video => 
          video.thumbnail && 
          video.title && 
          video.embed
        );
        
        setVideos(validVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  if (error) {
    return (
      <div className="videos-container">
        <div className="videos-header">
          <h1 className="videos-heading">
            <span>FOOTY </span>
            <span className="videos-heading-highlight">INSIGHTS </span>
            <span>VIDEOS</span>
          </h1>
        </div>
        <div className="video-error">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="video-retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-container">
      <div className="videos-header">
        <h1 className="videos-heading">
          <span>FOOTY </span>
          <span className="videos-heading-highlight">INSIGHTS </span>
          <span>VIDEOS</span>
        </h1>
      </div>

      {loading ? (
        <div className="video-loading-spinner">
          <div className="video-spinner"></div>
          <p>Loading match highlights...</p>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map((video, index) => (
            <div key={index} className="video-card" onClick={() => handleVideoClick(video)}>
              <div className="video-thumbnail">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  loading="lazy" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/640x360?text=Video+Thumbnail+Unavailable';
                  }}
                />
                <div className="video-play-overlay">
                  <div className="video-play-button">
                    <Play size={40} />
                  </div>
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-meta">
                  <span className="video-date-display">
                    <Calendar size={16} />
                    {formatDate(video.date)}
                  </span>
                  <span className="video-competition-tag">
                    {video.competition?.name || 'Football Match'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Videos; 