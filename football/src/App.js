import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Standings from "./components/Standings";
import Fixtures from "./components/Fixtures";
import Results from "./components/Results"; // Import Results component
import News from "./components/News"; 
import PlayerInfo from "./components/PlayerInfo"; 
import ManagerInfo from "./components/ManagerInfo"; 
import LiveScores from "./components/LiveScores"; // Import LiveScores Component
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { ThemeProvider } from "./context/ThemeContext";
import Chatbot from "./components/chatbot/Chatbot";
import Videos from './components/Videos';
import TransferUpdates from './components/TransferUpdates';
import LineupBuilder from "./components/LineupBuilder"; // Import LineupBuilder
import FootballQuiz from "./components/FootballQuiz/FootballQuiz"; // Import FootballQuiz

import MatchStatistics from './components/MatchStatistics';
import LineupView from './components/LineupView';
import TeamsInfo from './components/TeamsInfo';
import TeamStats from './components/TeamStats';
import TopPlayers from "./components/TopPlayers";
import WorldCupWinners from "./components/WorldCupWinners";
import BallondorWinners from "./components/BallondorWinners";
import GoldenBallWinners from "./components/GoldenBallWinners";
import ClubWorldCupWinners from "./components/ClubWorldCupWinners";
import SuccessfulFootballClubs from "./components/SuccessfulFootballClubs";
import SuccessfulIntTeams from "./components/SuccessfulIntTeams";
import StadiumsGallery from "./components/gallery/StadiumsGallery"; // Import StadiumsGallery
import StadiumDetail from "./components/gallery/StadiumDetail"; // Import StadiumDetail
import IconicMoments from "./components/gallery/IconicMoments"; // Import IconicMoments
import IconicMomentDetail from "./components/gallery/IconicMomentDetail"; // Import IconicMomentDetail
import CelebrationsGallery from "./components/gallery/CelebrationsGallery"; // Import CelebrationsGallery
import CelebrationDetail from "./components/gallery/CelebrationDetail"; // Import CelebrationDetail

// Animation wrapper component
const AnimatedRoutes = () => {
  const location = useLocation();
  const nodeRef = useRef(null);
  
  return (
    <TransitionGroup component={null}>
      <CSSTransition 
        key={location.key} 
        timeout={300} 
        classNames="page"
        nodeRef={nodeRef}
      >
        <div ref={nodeRef}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/results" element={<Results />} />
            <Route path="/news" element={<News />} />
            <Route path="/transfers" element={<TransferUpdates />} />
            <Route path="/playerinfo" element={<PlayerInfo />} />
            <Route path="/managerinfo" element={<ManagerInfo />} />
            <Route path="/lineup-builder" element={<LineupBuilder />} />
            <Route path="/football-quiz" element={<FootballQuiz />} />
            <Route path="/top-players" element={<TopPlayers />} />
            <Route path="/worldcup-winners" element={<WorldCupWinners />} />
            <Route path="/ballondor-winners" element={<BallondorWinners />} />
            <Route path="/goldenball-winners" element={<GoldenBallWinners />} />
            <Route path="/club-worldcup-winners" element={<ClubWorldCupWinners />} />
            <Route path="/successful-clubs" element={<SuccessfulFootballClubs />} />
            <Route path="/successful-national-teams" element={<SuccessfulIntTeams />} />
            <Route path="/livescores" element={<LiveScores />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/stadiums-gallery" element={<StadiumsGallery />} />
            <Route path="/stadium/:stadiumId" element={<StadiumDetail />} />
            <Route path="/iconic-moments" element={<IconicMoments />} />
            <Route path="/iconic-moment/:momentId" element={<IconicMomentDetail />} />
            <Route path="/celebrations-gallery" element={<CelebrationsGallery />} />
            <Route path="/celebration/:celebrationId" element={<CelebrationDetail />} />

            <Route path="/match-stats/:matchId" element={<MatchStatistics />} />
            <Route path="/match-lineups/:matchId" element={<LineupView />} />
            <Route path="/teams" element={<TeamsInfo />} />
            <Route path="/team-stats" element={<TeamStats />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          <Chatbot />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
