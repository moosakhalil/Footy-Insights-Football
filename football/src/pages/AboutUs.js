import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageStyles.css';

const AboutUs = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Images for the slider (you can replace with actual football-related images)
  const sliderImages = [
    'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1486286701208-1d58e9338013?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  ];
  
  // Auto advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sliderImages.length]);
  
  // Manually change slides
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  return (
    <div className="page-container">
      {/* Back to Home Button */}
      <Link to="/" className="back-to-home" title="Back to Home">
        <ArrowLeft />
      </Link>

      <div className="page-header">
        <h1>About Us</h1>
        <div className="page-header-line"></div>
      </div>
      
      <div className="page-content">
        <div className="about-hero">
          <div className="image-slider">
            <div className="slider-container">
              {sliderImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`slide ${index === currentSlide ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${image})` }}
                />
              ))}
              
              <div className="slider-controls">
                {sliderImages.map((_, index) => (
                  <button 
                    key={index} 
                    className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mission-container">
            <h2>Our Mission</h2>
            <p>
              At Footy Insights, our mission is to deliver real-time, accurate, and comprehensive football data to fans around the world. 
              We strive to create the ultimate football companion that enhances your experience of the beautiful game through cutting-edge 
              technology and passionate expertise.
            </p>
            <p>
              We believe that every fan deserves access to high-quality football information, regardless of which team they support or 
              where they are located. Our platform brings together live scores, in-depth statistics, and expert analysis to provide a 
              complete football experience.
            </p>
          </div>
        </div>
        
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2025 by a group of football enthusiasts and tech innovators, Footy Insights was born out of a shared passion 
            for the world's most popular sport. We recognized a gap in the market for a platform that combines live match data, 
            in-depth statistics, and user-friendly interfaces to create a seamless experience for football fans.
          </p>
          <p>
            What began as a small project has evolved into a comprehensive platform serving thousands of users daily across the globe. 
            Our team has grown, but our passion remains the same - to connect fans with the football information they crave in the 
            most engaging and accessible way possible.
          </p>
        </section>
        
        <section className="about-section team-section">
          <h2>Meet Our Team</h2>
          <p className="section-intro">
            Our diverse team brings together expertise in sports analytics, software engineering, design, and passionate football fandom.
            Each member contributes their unique skills and perspective to create the best possible platform for football enthusiasts worldwide.
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <img src="/Moosa.jpg" alt="Muhammad Moosa Khalil" />
              </div>
              <h3>Muhammad Moosa Khalil</h3>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <img src="Tayyab.jpg" alt="Tayyab Aamir Ali" />
              </div>
              <h3>Tayyab Aamir Ali</h3>
              <p>Chief Technology Officer</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Accuracy</h3>
              <p>We are committed to providing precise and reliable football data.</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>We constantly explore new technologies to enhance user experience.</p>
            </div>
            <div className="value-card">
              <h3>Accessibility</h3>
              <p>We make football information easily accessible to fans worldwide.</p>
            </div>
            <div className="value-card">
              <h3>Passion</h3>
              <p>We share our users' enthusiasm for the beautiful game of football.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs; 