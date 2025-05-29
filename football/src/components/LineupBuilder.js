import React, { useState, useEffect, useRef } from 'react';
import './LineupBuilder.css';
import html2canvas from 'html2canvas';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Download, RefreshCw } from 'lucide-react';
import playersData from '../data/FootballPlayers.json'; // <== Correct import from src/data

const ErrorModal = ({ message, onClose }) => (
  <div className="lbp-modal-overlay">
    <div className="lbp-modal">
      <div className="lbp-modal-message">{message}</div>
      <button className="lbp-modal-close" onClick={onClose}>×</button>
    </div>
  </div>
);

const LineupBuilder = () => {
  const { theme } = useTheme();
  const [formation, setFormation] = useState('4-3-3');
  const [lineup, setLineup] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [lineupName, setLineupName] = useState('');
  const [allPlayers, setAllPlayers] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalError, setModalError] = useState(null);
  const pitchRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Formations with positions
  const formations = {
    '4-3-3': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'lm', position: 'CM', x: '35%', y: '55%' },
      { id: 'cm', position: 'CM', x: '50%', y: '55%' },
      { id: 'rm', position: 'CM', x: '65%', y: '55%' },
      { id: 'lw', position: 'LW', x: '20%', y: '30%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' },
      { id: 'rw', position: 'RW', x: '80%', y: '30%' }
    ],
    '4-4-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'lm', position: 'LM', x: '25%', y: '55%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '55%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '55%' },
      { id: 'rm', position: 'RM', x: '75%', y: '55%' },
      { id: 'lst', position: 'LST', x: '35%', y: '25%' },
      { id: 'rst', position: 'RST', x: '65%', y: '25%' }
    ],
    '4-2-3-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'ldm', position: 'CDM', x: '35%', y: '60%' },
      { id: 'rdm', position: 'CDM', x: '65%', y: '60%' },
      { id: 'lam', position: 'LM', x: '25%', y: '45%' },
      { id: 'cam', position: 'CAM', x: '50%', y: '45%' },
      { id: 'ram', position: 'RM', x: '75%', y: '45%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-1-4-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '60%' },
      { id: 'lm', position: 'LM', x: '20%', y: '45%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '45%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '45%' },
      { id: 'rm', position: 'RM', x: '80%', y: '45%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-3-2-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'lcm', position: 'CM', x: '30%', y: '60%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '60%' },
      { id: 'rcm', position: 'CM', x: '70%', y: '60%' },
      { id: 'lcam', position: 'CAM', x: '35%', y: '40%' },
      { id: 'rcam', position: 'CAM', x: '65%', y: '40%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-1-2-1-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '65%' },
      { id: 'lcm', position: 'CM', x: '30%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '70%', y: '50%' },
      { id: 'cam', position: 'CAM', x: '50%', y: '40%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '3-4-3': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'lm', position: 'LM', x: '15%', y: '60%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '60%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '60%' },
      { id: 'rm', position: 'RM', x: '85%', y: '60%' },
      { id: 'lw', position: 'LW', x: '20%', y: '30%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' },
      { id: 'rw', position: 'RW', x: '80%', y: '30%' }
    ],
    '3-5-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '60%' },
      { id: 'lcm', position: 'CM', x: '30%', y: '50%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '70%', y: '50%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '60%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '3-2-4-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'ldm', position: 'CDM', x: '35%', y: '65%' },
      { id: 'rdm', position: 'CDM', x: '65%', y: '65%' },
      { id: 'lm', position: 'LM', x: '20%', y: '45%' },
      { id: 'lcm', position: 'CM', x: '40%', y: '45%' },
      { id: 'rcm', position: 'CM', x: '60%', y: '45%' },
      { id: 'rm', position: 'RM', x: '80%', y: '45%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '5-3-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '80%' },
      { id: 'lcm', position: 'CM', x: '30%', y: '50%' },
      { id: 'cm', position: 'CM', x: '50%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '70%', y: '50%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '5-4-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '80%' },
      { id: 'lm', position: 'LM', x: '20%', y: '50%' },
      { id: 'lcm', position: 'CM', x: '40%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '60%', y: '50%' },
      { id: 'rm', position: 'RM', x: '80%', y: '50%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-5-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'lm', position: 'LM', x: '15%', y: '50%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '50%' },
      { id: 'cm', position: 'CM', x: '50%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '50%' },
      { id: 'rm', position: 'RM', x: '85%', y: '50%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-4-1-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'lm', position: 'LM', x: '20%', y: '55%' },
      { id: 'lcm', position: 'CM', x: '40%', y: '55%' },
      { id: 'rcm', position: 'CM', x: '60%', y: '55%' },
      { id: 'rm', position: 'RM', x: '80%', y: '55%' },
      { id: 'cam', position: 'CAM', x: '50%', y: '35%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-2-2-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'ldm', position: 'CDM', x: '35%', y: '60%' },
      { id: 'rdm', position: 'CDM', x: '65%', y: '60%' },
      { id: 'lcam', position: 'CAM', x: '35%', y: '40%' },
      { id: 'rcam', position: 'CAM', x: '65%', y: '40%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '4-2-4': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'ldm', position: 'CDM', x: '35%', y: '55%' },
      { id: 'rdm', position: 'CDM', x: '65%', y: '55%' },
      { id: 'lw', position: 'LW', x: '20%', y: '30%' },
      { id: 'lst', position: 'ST', x: '40%', y: '25%' },
      { id: 'rst', position: 'ST', x: '60%', y: '25%' },
      { id: 'rw', position: 'RW', x: '80%', y: '30%' }
    ],
    '3-4-2-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '60%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '55%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '55%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '60%' },
      { id: 'lcam', position: 'CAM', x: '35%', y: '35%' },
      { id: 'rcam', position: 'CAM', x: '65%', y: '35%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '3-4-1-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '60%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '55%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '55%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '60%' },
      { id: 'cam', position: 'CAM', x: '50%', y: '35%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '4-3-1-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'lcm', position: 'CM', x: '30%', y: '60%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '60%' },
      { id: 'rcm', position: 'CM', x: '70%', y: '60%' },
      { id: 'cam', position: 'CAM', x: '50%', y: '40%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '5-2-3': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '80%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '55%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '55%' },
      { id: 'lw', position: 'LW', x: '20%', y: '30%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' },
      { id: 'rw', position: 'RW', x: '80%', y: '30%' }
    ],
    '5-2-2-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '80%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '55%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '55%' },
      { id: 'lcam', position: 'CAM', x: '35%', y: '35%' },
      { id: 'rcam', position: 'CAM', x: '65%', y: '35%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ],
    '4-2-1-3': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'ldm', position: 'CDM', x: '35%', y: '60%' },
      { id: 'rdm', position: 'CDM', x: '65%', y: '60%' },
      { id: 'cam', position: 'CAM', x: '50%', y: '45%' },
      { id: 'lw', position: 'LW', x: '20%', y: '30%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' },
      { id: 'rw', position: 'RW', x: '80%', y: '30%' }
    ],
    '4-1-2-3': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '60%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '45%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '45%' },
      { id: 'lw', position: 'LW', x: '20%', y: '30%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' },
      { id: 'rw', position: 'RW', x: '80%', y: '30%' }
    ],
    '3-1-4-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lcb', position: 'CB', x: '30%', y: '80%' },
      { id: 'cb', position: 'CB', x: '50%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '70%', y: '80%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '65%' },
      { id: 'lwb', position: 'LWB', x: '15%', y: '50%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '50%' },
      { id: 'rwb', position: 'RWB', x: '85%', y: '50%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '4-1-3-2': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '60%' },
      { id: 'lm', position: 'LM', x: '20%', y: '45%' },
      { id: 'cm', position: 'CM', x: '50%', y: '45%' },
      { id: 'rm', position: 'RM', x: '80%', y: '45%' },
      { id: 'lst', position: 'ST', x: '35%', y: '25%' },
      { id: 'rst', position: 'ST', x: '65%', y: '25%' }
    ],
    '4-1-2-2-1': [
      { id: 'gk', position: 'GK', x: '50%', y: '95%' },
      { id: 'lb', position: 'LB', x: '15%', y: '80%' },
      { id: 'lcb', position: 'CB', x: '35%', y: '80%' },
      { id: 'rcb', position: 'CB', x: '65%', y: '80%' },
      { id: 'rb', position: 'RB', x: '85%', y: '80%' },
      { id: 'cdm', position: 'CDM', x: '50%', y: '65%' },
      { id: 'lcm', position: 'CM', x: '35%', y: '50%' },
      { id: 'rcm', position: 'CM', x: '65%', y: '50%' },
      { id: 'lw', position: 'LW', x: '30%', y: '35%' },
      { id: 'rw', position: 'RW', x: '70%', y: '35%' },
      { id: 'st', position: 'ST', x: '50%', y: '25%' }
    ]
  }

  const positionMappings = {
    'GK': ['GK'],
    'CB': ['CB'],
    'LB': ['LB'],
    'RB': ['RB'],
    'LWB': ['LWB', 'LB'],
    'RWB': ['RWB', 'RB'],
    'CDM': ['CDM', 'CM'],
    'CM': ['CM', 'CDM', 'CAM'],
    'CAM': ['CAM', 'CM'],
    'LM': ['LM', 'LW'],
    'RM': ['RM', 'RW'],
    'LW': ['LW', 'LM'],
    'RW': ['RW', 'RM'],
    'ST': ['ST']
  };

  useEffect(() => {
    try {
      // Check if playersData has the players array
      if (!playersData || !playersData.players || !Array.isArray(playersData.players)) {
        throw new Error('Invalid player data format');
      }

      // Map the players data with proper validation
      const players = playersData.players.map(player => {
        if (!player.id || !player.name || !player.position || !player.rating) {
          console.warn('Invalid player data:', player);
          return null;
        }
        return {
          ...player,
          id: player.id.toString(),
          rating: parseInt(player.rating, 10) || 0,
          photo: player.imageUrl || null
        };
      }).filter(Boolean); // Remove any null entries

      setAllPlayers(players);
      
      // Initialize empty lineup based on formation
      if (formations[formation]) {
        initializeLineup(formations[formation]);
      } else {
        setFormation('4-3-3'); // Fallback to default formation
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading player data:', err);
      setModalError('Error loading player data. Please try again later.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Re-initialize lineup when formation changes
    initializeLineup(formations[formation]);
  }, [formation]);

  const initializeLineup = (positionsConfig) => {
    setLineup(positionsConfig.map(pos => ({
      ...pos,
      player: null
    })));
  };

  const handlePositionClick = (positionId) => {
    const position = lineup.find(pos => pos.id === positionId);
    if (!position) return;

    if (position.player) {
      // Allow removing player by clicking again
      handleRemovePlayer(positionId);
      return;
    }

    setSelectedPosition(positionId);
    setIsSearchOpen(true);
  };

  const handlePlayerSelect = (player) => {
    if (!selectedPosition || !player) return;
    
    const position = lineup.find(pos => pos.id === selectedPosition);
    if (!position) return;

    // Check if player can play in this position
    const validPositions = positionMappings[position.position] || [];
    if (!validPositions.includes(player.position)) {
      setModalError(`${player.name} cannot play as ${position.position}`);
      setTimeout(() => setModalError(null), 3000);
      return;
    }

    // Check if player is already in lineup
    const isPlayerInLineup = lineup.some(pos => pos.player?.id === player.id);
    if (isPlayerInLineup) {
      setModalError(`${player.name} is already in the lineup`);
      setTimeout(() => setModalError(null), 3000);
      return;
    }
    
    // Update lineup with selected player
    setLineup(prevLineup => 
      prevLineup.map(pos => 
        pos.id === selectedPosition 
          ? { ...pos, player } 
          : pos
      )
    );
    
    // Update recent players
    setRecentPlayers(prev => {
      const filtered = prev.filter(p => p.id !== player.id);
      return [player, ...filtered].slice(0, 10);
    });
    
    setIsSearchOpen(false);
    setSelectedPosition(null);
    setSearchText('');
  };

  const getRecommendedPlayers = (positionId) => {
    const position = lineup.find(pos => pos.id === positionId);
    if (!position) return [];
    
    // Get valid positions for this role
    const validPositions = positionMappings[position.position] || [];
    
    // Get current lineup player IDs
    const currentLineupPlayerIds = lineup
      .filter(pos => pos.player)
      .map(pos => pos.player.id);
    
    // Get players who can play in this position and aren't already in lineup
    return allPlayers
      .filter(player => 
        validPositions.includes(player.position) &&
        !currentLineupPlayerIds.includes(player.id)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  };

  const handleFormationChange = (e) => {
    const newFormation = e.target.value;
    setFormation(newFormation);
  };

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredPlayers = searchText.trim() 
    ? allPlayers.filter(player => 
        player.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (player.club && player.club.toLowerCase().includes(searchText.toLowerCase()))
      )
    : [];

  const handleRemovePlayer = (positionId) => {
    setLineup(prevLineup => 
      prevLineup.map(pos => 
        pos.id === positionId 
          ? { ...pos, player: null } 
          : pos
      )
    );
  };

  const handleDownloadLineup = async () => {
    if (!pitchRef.current) {
      setModalError('Unable to capture lineup. Please try again.');
      setTimeout(() => setModalError(null), 3000);
      return;
    }
    
    if (!canDownload) {
      setModalError('Add at least one player to download the lineup');
      setTimeout(() => setModalError(null), 3000);
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Add lineup info overlay
      const infoOverlay = document.createElement('div');
      infoOverlay.classList.add('lbp-lineup-info-overlay');
      
      // Add formation and lineup name
      const lineupInfo = document.createElement('div');
      lineupInfo.classList.add('lbp-lineup-info');
      lineupInfo.innerHTML = `
        <h2>${lineupName || 'My Lineup'}</h2>
        <h3>Formation: ${formation}</h3>
      `;
      infoOverlay.appendChild(lineupInfo);
      
      // Add watermark
      const watermark = document.createElement('div');
      watermark.classList.add('lbp-watermark');
      watermark.style.position = 'absolute';
      watermark.style.bottom = '10px';
      watermark.style.right = '10px';
      watermark.style.fontSize = '14px';
      watermark.style.color = 'rgba(255, 255, 255, 0.7)';
      watermark.style.fontFamily = 'Arial, sans-serif';
      watermark.textContent = 'Created with Football Plus';
      
      // Add elements temporarily
      pitchRef.current.appendChild(infoOverlay);
      pitchRef.current.appendChild(watermark);
      
      const canvas = await html2canvas(pitchRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.getElementsByTagName('img');
          return Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }));
        }
      });
      
      // Remove temporary elements
      pitchRef.current.removeChild(infoOverlay);
      pitchRef.current.removeChild(watermark);
      
      const image = canvas.toDataURL('image/png', 1.0);
      
      // Create download link
      const link = document.createElement('a');
      link.href = image;
      link.download = `${lineupName || 'my-lineup'}-${formation}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error downloading lineup:', err);
      setModalError('Failed to download lineup. Please try again.');
      setTimeout(() => setModalError(null), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearLineup = () => {
    if (lineup.some(pos => pos.player !== null)) {
      if (window.confirm('Are you sure you want to clear the entire lineup?')) {
        setLineup(prevLineup => prevLineup.map(pos => ({ ...pos, player: null })));
      }
    }
  };

  const canDownload = lineup.some(pos => pos.player !== null);

  const getPlayerInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const PlayerAvatar = ({ player, size = 120, isThumbnail = false }) => {
    const [imgError, setImgError] = useState(false);
    const initials = player ? getPlayerInitials(player.name) : '';
    
    if (!player) return null;

    // For thumbnails, use the original circular style
    if (isThumbnail) {
      return imgError ? (
        <div 
          className="lbp-player-initials" 
          style={{
            width: size,
            height: size,
            backgroundColor: '#2c3e50',
            color: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.4,
            fontWeight: 'bold'
          }}
        >
          {initials}
        </div>
      ) : (
        <img
          src={player.photo}
          alt={player.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            setImgError(true);
          }}
        />
      );
    }

    // For cards in the lineup
    return imgError ? (
      <div 
        className="lbp-player-initials" 
        style={{
          width: size * 1.33,
          height: size * 1.87, // Adjust height for card aspect ratio
          backgroundColor: '#2c3e50',
          color: '#fff',
          borderRadius: '8px', // Rectangular card with rounded corners
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          fontWeight: 'bold'
        }}
      >
        {initials}
      </div>
    ) : (
      <img
        src={player.photo}
        alt={player.name}
        style={{
          width: size * 1.33,
          height: 'auto',
          borderRadius: '0',
          filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.25))'
        }}
        onError={(e) => {
          setImgError(true);
        }}
      />
    );
  };

  const isLineupComplete = lineup.every(pos => pos.player !== null);

  if (isLoading) {
    return (
      <div className="lbp-lineup-builder">
        <div className="lbp-loading">Loading players...</div>
      </div>
    );
  }

  return (
    <div className={`lbp-lineup-builder ${theme === 'dark' ? 'lbp-dark-theme' : 'lbp-light-theme'}`}>
      <div className="lbp-lineup-header">
        <div className="lbp-lineup-header-left">
          <h2 className="lbp-lineup-title">Lineup <span className="lbp-builder-text">Builder</span></h2>
        </div>
        
        <div className="lbp-formation-selector">
          <select 
            className="lbp-formation-dropdown" 
            value={formation} 
            onChange={handleFormationChange}
          >
            {Object.keys(formations).map(form => (
              <option key={form} value={form}>{form}</option>
            ))}
          </select>
        </div>
      </div>

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
      
      <div className="lbp-builder-content">
        <div className="lbp-pitch-container">
          <div className="lbp-lineup-name-container">
            <input 
              className="lbp-lineup-name-input"
              type="text" 
              placeholder="Lineup Name"
              value={lineupName} 
              onChange={(e) => setLineupName(e.target.value)} 
            />
          </div>
          
          <div className={`lbp-pitch lbp-formation-${formation.replace(/[-]/g, '')}`} ref={pitchRef}>
            <div className="lbp-pitch-markings">
              <div className="lbp-center-line"></div>
              <div className="lbp-center-circle"></div>
              <div className="lbp-center-spot"></div>
              
              <div className="lbp-penalty-box lbp-top"></div>
              <div className="lbp-goal-box lbp-top"></div>
              <div className="lbp-penalty-spot lbp-top"></div>
              <div className="lbp-penalty-arc lbp-top"></div>
              
              <div className="lbp-penalty-box lbp-bottom"></div>
              <div className="lbp-goal-box lbp-bottom"></div>
              <div className="lbp-penalty-spot lbp-bottom"></div>
              <div className="lbp-penalty-arc lbp-bottom"></div>
              
              <div className="lbp-corner-arc lbp-top-left"></div>
              <div className="lbp-corner-arc lbp-top-right"></div>
              <div className="lbp-corner-arc lbp-bottom-left"></div>
              <div className="lbp-corner-arc lbp-bottom-right"></div>
            </div>
            
            {lineup.map((pos) => (
              <div 
                key={pos.id}
                className={`lbp-player-position ${pos.player ? 'lbp-filled' : ''}`}
                style={{ left: pos.x, top: pos.y }}
                data-position={pos.position}
              >
                <div 
                  className={`lbp-player-avatar ${!pos.player ? 'lbp-empty' : ''}`}
                  onClick={() => !pos.player && handlePositionClick(pos.id)}
                >
                  {pos.player ? (
                    <>
                      <PlayerAvatar player={pos.player} size={120} />
                      <button className="lbp-remove-player-btn" onClick={(e) => { e.stopPropagation(); handleRemovePlayer(pos.id); }} title="Remove player">×</button>
                    </>
                  ) : (
                    <span className="lbp-add-player">+</span>
                  )}
                </div>
                <div className="lbp-position-label">{pos.position}</div>
              </div>
            ))}
          </div>
          
          <div className="lbp-lineup-actions">
            <button 
              className={`lbp-lineup-action-btn lbp-clear-btn`}
              onClick={handleClearLineup}
            >
              <Trash2 size={16} /> Clear Lineup
            </button>
            
            <button 
              className={`lbp-lineup-action-btn lbp-download-btn ${isLineupComplete ? 'lbp-active' : 'lbp-disabled'}`}
              onClick={isLineupComplete && !isDownloading ? handleDownloadLineup : undefined}
              disabled={!isLineupComplete || isDownloading}
            >
              {isDownloading ? (
                <>
                  <RefreshCw size={16} className="lbp-loading-icon" /> Downloading...
                </>
              ) : (
                <>
                  <Download size={16} /> Download Lineup
                </>
              )}
            </button>
        </div>
      </div>
      
      {isSearchOpen && (
          <div className="lbp-search-overlay">
            <div className="lbp-search-container">
              <div className="lbp-search-header">
              <input
                  className="lbp-search-input"
                type="text"
                  placeholder="Search for players..."
                value={searchText}
                  onChange={handleSearchTextChange}
                autoFocus
                />
                <button
                  className="lbp-cancel-button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSelectedPosition(null);
                    setSearchText('');
                  }}
                >
                Cancel
              </button>
            </div>
            
              <div className="lbp-search-results">
                {searchText.trim() ? (
                  <>
                    <h3 className="lbp-search-section-title">Search Results</h3>
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.slice(0, 20).map(player => (
                        <div 
                          key={player.id} 
                          className="lbp-player-result"
                          onClick={() => handlePlayerSelect(player)}
                        >
                          <div className="lbp-player-thumbnail">
                            <PlayerAvatar player={player} size={40} isThumbnail={true} />
                          </div>
                          <div className="lbp-player-info">
                            <div>{player.name}</div>
                            <div className="lbp-player-team">{player.club || 'Free Agent'}</div>
                          </div>
                          <div className="lbp-player-rating">{player.rating}</div>
                        </div>
                      ))
                    ) : (
                      <div className="lbp-no-results">No players found</div>
                  )}
                </>
              ) : (
                  <>
                    <h3 className="lbp-search-section-title">Recommended Players</h3>
                    {selectedPosition && getRecommendedPlayers(selectedPosition).map(player => (
                    <div 
                      key={player.id} 
                        className="lbp-player-result"
                      onClick={() => handlePlayerSelect(player)}
                    >
                        <div className="lbp-player-thumbnail">
                      <PlayerAvatar player={player} size={40} isThumbnail={true} />
                        </div>
                        <div className="lbp-player-info">
                          <div>{player.name}</div>
                          <div className="lbp-player-team">{player.club || 'Free Agent'}</div>
                        </div>
                        <div className="lbp-player-rating">{player.rating}</div>
                      </div>
                    ))}
                    
                    {recentPlayers.length > 0 && (
                      <>
                        <h3 className="lbp-search-section-title">Recent Players</h3>
                        {recentPlayers.map(player => (
                          <div 
                            key={player.id} 
                            className="lbp-player-result"
                            onClick={() => handlePlayerSelect(player)}
                          >
                            <div className="lbp-player-thumbnail">
                              <PlayerAvatar player={player} size={40} isThumbnail={true} />
                            </div>
                            <div className="lbp-player-info">
                              <div>{player.name}</div>
                              <div className="lbp-player-team">{player.club || 'Free Agent'}</div>
                            </div>
                            <div className="lbp-player-rating">{player.rating}</div>
                    </div>
                        ))}
                      </>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LineupBuilder;