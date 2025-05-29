import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MessageCircle, Menu, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdatesDropdownOpen, setIsUpdatesDropdownOpen] = useState(false);
  const [isNewsDropdownOpen, setIsNewsDropdownOpen] = useState(false);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const updatesDropdownRef = useRef(null);
  const newsDropdownRef = useRef(null);
  const historyDropdownRef = useRef(null);
  const galleryDropdownRef = useRef(null);
  const aboutDropdownRef = useRef(null);

  // Check if viewport is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu and all dropdowns when location changes
  useEffect(() => {
    setIsOpen(false);
    closeAllDropdowns();
  }, [location]);

  const closeAllDropdowns = () => {
    setIsDropdownOpen(false);
    setIsUpdatesDropdownOpen(false);
    setIsNewsDropdownOpen(false);
    setIsHistoryDropdownOpen(false);
    setIsGalleryDropdownOpen(false);
    setIsAboutDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = (ref) => ref.current && ref.current.contains(event.target);
      
      if (!isClickInsideDropdown(dropdownRef)) setIsDropdownOpen(false);
      if (!isClickInsideDropdown(updatesDropdownRef)) setIsUpdatesDropdownOpen(false);
      if (!isClickInsideDropdown(newsDropdownRef)) setIsNewsDropdownOpen(false);
      if (!isClickInsideDropdown(historyDropdownRef)) setIsHistoryDropdownOpen(false);
      if (!isClickInsideDropdown(galleryDropdownRef)) setIsGalleryDropdownOpen(false);
      if (!isClickInsideDropdown(aboutDropdownRef)) setIsAboutDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGmailClick = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=alphidedevelopers@gmail.com', '_blank');
  };

  // Handle dropdown toggles
  const toggleDropdown = (setter, currentState) => {
    if (isMobile) {
      closeAllDropdowns();
      setter(!currentState);
    }
  };

  // Handle mouse enter for desktop
  const handleMouseEnter = (setter) => {
    if (!isMobile) {
      closeAllDropdowns();
      setter(true);
    }
  };

  // Handle mouse leave for desktop
  const handleMouseLeave = (setter) => {
    if (!isMobile) {
      setter(false);
    }
  };

  return (
    <header className="navbar">
      <div className="logo-container">
        <img 
          src={theme === 'light' ? "/logo1.jpg" : "/logo2.jpg"} 
          alt="Footy Insights Logo" 
          className="logo-image" 
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="nav-links">
        <div><NavLink to="/" className={({isActive}) => isActive ? "nav-btn active" : "nav-btn"}>Home</NavLink></div>
        
        {/* Updates Dropdown */}
        <div 
          className="dropdown-container" 
          ref={updatesDropdownRef}
          onMouseEnter={() => handleMouseEnter(setIsUpdatesDropdownOpen)}
          onMouseLeave={() => handleMouseLeave(setIsUpdatesDropdownOpen)}
        >
          <button 
            className={`nav-btn dropdown-btn ${isUpdatesDropdownOpen ? 'active' : ''}`}
            onClick={() => toggleDropdown(setIsUpdatesDropdownOpen, isUpdatesDropdownOpen)}
          >
            Updates
            <ChevronDown className={`dropdown-icon ${isUpdatesDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className={`dropdown-menu ${isUpdatesDropdownOpen ? 'show' : ''}`}>
            <NavLink to="/fixtures" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Fixtures
            </NavLink>
            <NavLink to="/results" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Results
            </NavLink>
            <NavLink to="/standings" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Standings
            </NavLink>
            <NavLink to="/livescores" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Live Scores
            </NavLink>
          </div>
        </div>
        
        {/* Info Dropdown */}
        <div 
          className="dropdown-container" 
          ref={dropdownRef}
          onMouseEnter={() => handleMouseEnter(setIsDropdownOpen)}
          onMouseLeave={() => handleMouseLeave(setIsDropdownOpen)}
        >
          <button 
            className={`nav-btn dropdown-btn ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => toggleDropdown(setIsDropdownOpen, isDropdownOpen)}
          >
            Info
            <ChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
            <NavLink to="/playerinfo" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Player Info
            </NavLink>
            <NavLink to="/managerinfo" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Manager Info
            </NavLink>
            <NavLink to="/teams" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Teams
            </NavLink>
            <NavLink to="/team-stats" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Team Stats
            </NavLink>
            <NavLink to="/lineup-builder" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Make Your XI
            </NavLink>
            <NavLink to="/football-quiz" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Football Quiz
            </NavLink>
          </div>
        </div>

        {/* News Dropdown */}
        <div 
          className="dropdown-container" 
          ref={newsDropdownRef}
          onMouseEnter={() => handleMouseEnter(setIsNewsDropdownOpen)}
          onMouseLeave={() => handleMouseLeave(setIsNewsDropdownOpen)}
        >
          <button 
            className={`nav-btn dropdown-btn ${isNewsDropdownOpen ? 'active' : ''}`}
            onClick={() => toggleDropdown(setIsNewsDropdownOpen, isNewsDropdownOpen)}
          >
            News
            <ChevronDown className={`dropdown-icon ${isNewsDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className={`dropdown-menu ${isNewsDropdownOpen ? 'show' : ''}`}>
            <NavLink to="/news" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Latest News
            </NavLink>
            <NavLink to="/videos" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Videos
            </NavLink>
            <NavLink to="/transfers" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Transfer Updates
            </NavLink>
          </div>
        </div>

        {/* Gallery Dropdown */}
        <div 
          className="dropdown-container" 
          ref={galleryDropdownRef}
          onMouseEnter={() => handleMouseEnter(setIsGalleryDropdownOpen)}
          onMouseLeave={() => handleMouseLeave(setIsGalleryDropdownOpen)}
        >
          <button 
            className={`nav-btn dropdown-btn ${isGalleryDropdownOpen ? 'active' : ''}`}
            onClick={() => toggleDropdown(setIsGalleryDropdownOpen, isGalleryDropdownOpen)}
          >
            Gallery
            <ChevronDown className={`dropdown-icon ${isGalleryDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className={`dropdown-menu ${isGalleryDropdownOpen ? 'show' : ''}`}>
            <NavLink to="/stadiums-gallery" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Famous Stadiums
            </NavLink>
            <NavLink to="/iconic-moments" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Iconic Moments
            </NavLink>
            <NavLink to="/celebrations-gallery" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Goal Celebrations
            </NavLink>
          </div>
        </div>

        {/* History Dropdown */}
        <div 
          className="dropdown-container" 
          ref={historyDropdownRef}
          onMouseEnter={() => handleMouseEnter(setIsHistoryDropdownOpen)}
          onMouseLeave={() => handleMouseLeave(setIsHistoryDropdownOpen)}
        >
          <button 
            className={`nav-btn dropdown-btn ${isHistoryDropdownOpen ? 'active' : ''}`}
            onClick={() => toggleDropdown(setIsHistoryDropdownOpen, isHistoryDropdownOpen)}
          >
            History
            <ChevronDown className={`dropdown-icon ${isHistoryDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className={`dropdown-menu ${isHistoryDropdownOpen ? 'show' : ''}`}>
            <NavLink to="/worldcup-winners" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              World Cup Winners
            </NavLink>
            <NavLink to="/club-worldcup-winners" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Club WC Winners
            </NavLink>
            <NavLink to="/ballondor-winners" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Ballon d'Or Winners
            </NavLink>
            <NavLink to="/goldenball-winners" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Golden Ball Winners
            </NavLink>
            <NavLink to="/successful-clubs" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Successful Clubs
            </NavLink>
            <NavLink to="/successful-national-teams" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Successful National Teams
            </NavLink>
            <NavLink to="/top-players" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Top 100 Players
            </NavLink>
          </div>
        </div>

        <div>
          <a 
            href="http://localhost:3001" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-btn"
          >
            Store
          </a>
        </div>
        
        {/* About Dropdown */}
        <div className="dropdown-container" ref={aboutDropdownRef}>
          <button 
            className={`nav-btn dropdown-btn ${isAboutDropdownOpen ? 'active' : ''}`}
            onClick={() => toggleDropdown(setIsAboutDropdownOpen, isAboutDropdownOpen)}
          >
            About
            <ChevronDown className={`dropdown-icon ${isAboutDropdownOpen ? 'open' : ''}`} />
          </button>
          <div className={`dropdown-menu ${isAboutDropdownOpen ? 'show' : ''}`}>
            <NavLink to="/about-us" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              About Us
            </NavLink>
            <NavLink to="/contact-us" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Contact Us
            </NavLink>
            <NavLink to="/privacy-policy" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Privacy Policy
            </NavLink>
            <NavLink to="/terms-of-service" className={({isActive}) => isActive ? "dropdown-item active" : "dropdown-item"}>
              Terms of Service
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Icons and Mobile Menu */}
      <div className="icons">
        <MessageCircle className="icon" onClick={handleGmailClick} />
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="icon" /> : <Sun className="icon" />}
        </button>
        <Menu className="menu-icon" onClick={() => setIsOpen(!isOpen)} />
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <div><NavLink to="/" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Home</NavLink></div>
          
          {/* Updates Dropdown for mobile */}
          <div className="mobile-dropdown">
            <button 
              className={`mobile-btn ${isUpdatesDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsUpdatesDropdownOpen(!isUpdatesDropdownOpen)}
            >
              Updates
              <ChevronDown className={`mobile-dropdown-icon ${isUpdatesDropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`mobile-dropdown-menu ${isUpdatesDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/fixtures" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Fixtures</NavLink>
              <NavLink to="/results" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Results</NavLink>
              <NavLink to="/standings" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Standings</NavLink>
              <NavLink to="/livescores" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Live Scores</NavLink>
            </div>
          </div>
          
          {/* Info Dropdown for mobile (renamed from Football Info) */}
          <div className="mobile-dropdown">
            <button 
              className={`mobile-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Info
              <ChevronDown className={`mobile-dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`mobile-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/playerinfo" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Player Info</NavLink>
              <NavLink to="/managerinfo" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Manager Info</NavLink>
              <NavLink to="/teams" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Teams</NavLink>
              <NavLink to="/team-stats" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Team Stats</NavLink>
              <NavLink to="/lineup-builder" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Make Your XI</NavLink>
              <NavLink to="/football-quiz" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Football Quiz</NavLink>
            </div>
          </div>
          
          {/* News Dropdown for mobile */}
          <div className="mobile-dropdown">
            <button 
              className={`mobile-btn ${isNewsDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsNewsDropdownOpen(!isNewsDropdownOpen)}
            >
              News
              <ChevronDown className={`mobile-dropdown-icon ${isNewsDropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`mobile-dropdown-menu ${isNewsDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/news" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Latest News</NavLink>
              <NavLink to="/videos" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Videos</NavLink>
              <NavLink to="/transfers" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Transfer Updates</NavLink>
            </div>
          </div>
          
          {/* Gallery Dropdown for mobile */}
          <div className="mobile-dropdown">
            <button 
              className={`mobile-btn ${isGalleryDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsGalleryDropdownOpen(!isGalleryDropdownOpen)}
            >
              Gallery
              <ChevronDown className={`mobile-dropdown-icon ${isGalleryDropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`mobile-dropdown-menu ${isGalleryDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/stadiums-gallery" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Famous Stadiums</NavLink>
              <NavLink to="/iconic-moments" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Iconic Moments</NavLink>
              <NavLink to="/celebrations-gallery" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Goal Celebrations</NavLink>
            </div>
          </div>
          
          {/* History Dropdown for mobile */}
          <div className="mobile-dropdown">
            <button 
              className={`mobile-btn ${isHistoryDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
            >
              History
              <ChevronDown className={`mobile-dropdown-icon ${isHistoryDropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`mobile-dropdown-menu ${isHistoryDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/worldcup-winners" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>World Cup Winners</NavLink>
              <NavLink to="/club-worldcup-winners" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Club WC Winners</NavLink>
              <NavLink to="/ballondor-winners" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Ballon d'Or Winners</NavLink>
              <NavLink to="/goldenball-winners" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Golden Ball Winners</NavLink>
              <NavLink to="/successful-clubs" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Successful Clubs</NavLink>
              <NavLink to="/successful-national-teams" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Successful National Teams</NavLink>
              <NavLink to="/top-players" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Top 100 Players</NavLink>
            </div>
          </div>
          
          {/* Store link for mobile */}
          <div>
            <a 
              href="http://localhost:3001" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mobile-btn"
            >
              Store
            </a>
          </div>
          
          {/* About Dropdown for mobile */}
          <div className="mobile-dropdown">
            <button 
              className={`mobile-btn ${isAboutDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
            >
              About
              <ChevronDown className={`mobile-dropdown-icon ${isAboutDropdownOpen ? 'open' : ''}`} />
            </button>
            <div className={`mobile-dropdown-menu ${isAboutDropdownOpen ? 'show' : ''}`}>
              <NavLink to="/about-us" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>About Us</NavLink>
              <NavLink to="/contact-us" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Contact Us</NavLink>
              <NavLink to="/privacy-policy" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Privacy Policy</NavLink>
              <NavLink to="/terms-of-service" className={({isActive}) => isActive ? "mobile-btn active" : "mobile-btn"}>Terms of Service</NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;