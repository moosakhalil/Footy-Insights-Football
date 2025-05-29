import React, { useState, useEffect } from "react";
import { ChevronRight, Trophy, Activity, Users, Facebook, Twitter, Instagram, Github, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Import CSS file

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slider images
  const sliderImages = [
    {
      url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Live Football Scores",
      subtitle: "Track your favorite teams in real-time"
    },
    {
      url: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Comprehensive Stats",
      subtitle: "Deep insights into player and team performance"
    },
    {
      url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Expert Analysis",
      subtitle: "In-depth football insights and commentary"
    }
  ];

  // Auto advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Navigate to matches page
  const handleExplore = () => {
    navigate('/livescores');
  };

  // Slider navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <div className="home-container">
      {/* Hero Section with Slider */}
      <section className="hero-slider">
        <div className="slides-container">
          {sliderImages.map((slide, index) => (
            <div 
              key={index} 
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.url})` }}
            >
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <button className="explore-btn" onClick={handleExplore}>
                  Explore Now <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
          
          <button className="slider-nav prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="slider-nav next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
          
          <div className="slider-dots">
            {sliderImages.map((_, index) => (
              <button 
                key={index} 
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header center">
          <h2>Features & Services</h2>
          <p>Everything you need to follow your favorite sport</p>
        </div>
        
        <div className="features">
          {[
            { 
              title: "Live Scores", 
              desc: "Stay updated with real-time football match updates worldwide.",
              icon: <Activity className="feature-icon" />
            },
            { 
              title: "League Standings", 
              desc: "Track your favorite teams and their positions in the league.",
              icon: <Trophy className="feature-icon" />
            },
            { 
              title: "Players Info", 
              desc: "Discover player stats, performances, and top scorers.",
              icon: <Users className="feature-icon" />
            },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              {feature.icon}
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/about" className="footer-link">About Us</a>
            <a href="/contact" className="footer-link">Contact</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Service</a>
          </div>
          
          <div className="footer-social">
            <a href="#" className="social-icon"><Facebook size={20} /></a>
            <a href="#" className="social-icon"><Twitter size={20} /></a>
            <a href="#" className="social-icon"><Instagram size={20} /></a>
            <a href="#" className="social-icon"><Github size={20} /></a>
          </div>
          
          <div className="copyright">
            © 2025 Footy Insights | Your Ultimate Football Companion
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;