import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import './StadiumSlider.css';

const StadiumSlider = ({ images, stadiumName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      prev();
    } else if (e.key === 'ArrowRight') {
      next();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Reset current index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  // Handle navigation
  const next = () => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const prev = () => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Handle image download
  const handleDownload = () => {
    if (!images || images.length === 0 || currentIndex >= images.length) return;
    
    const currentImage = images[currentIndex];
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Extract filename from the image URL
    const filename = currentImage.split('/').pop() || `${stadiumName.replace(/\s+/g, '_')}_image.jpg`;
    
    link.href = currentImage;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="stadium-slider-container">
        <div className="stadium-slider-placeholder">
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stadium-slider-container">
      <div className="stadium-slider">
        <div 
          className={`slider-images ${isTransitioning ? 'transitioning' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="slider-image-wrapper">
              <img 
                src={image} 
                alt={`${stadiumName} - view ${index + 1}`} 
                className="slider-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        
        {images.length > 1 && (
          <>
            <button 
              className="slider-nav-btn prev-btn" 
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="slider-nav-btn next-btn" 
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        <button 
          className="download-btn" 
          onClick={handleDownload}
          aria-label="Download image"
        >
          <Download size={20} />
          <span>Download</span>
        </button>
      </div>
      
      {images.length > 1 && (
        <div className="slider-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`slider-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                  setTimeout(() => {
                    setIsTransitioning(false);
                  }, 300);
                }
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StadiumSlider; 