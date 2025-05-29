import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import quizData from '../../data/football-quiz-json.json';
import './FootballQuizStyles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CheckCircleIcon, XCircleIcon, DownloadIcon, ClockIcon, Download, RefreshCw } from 'lucide-react';

// Sample images for different categories
const defaultImages = {
  player: 'https://via.placeholder.com/400x300/4facfe/ffffff?text=Football+Player',
  team: 'https://via.placeholder.com/400x300/4facfe/ffffff?text=Football+Team',
  ball: 'https://via.placeholder.com/400x300/4facfe/ffffff?text=Football',
  general: 'https://via.placeholder.com/400x300/4facfe/ffffff?text=Football+Quiz'
};

// Helper function to get appropriate image
const getQuizImage = (question) => {
  // Try to load from the JSON path using PUBLIC_URL
  if (question.imageUrl) {
    // Convert paths like "public/quiz/image.jpg" to "/quiz/image.jpg"
    let imagePath = question.imageUrl;
    if (imagePath.startsWith('public/')) {
      imagePath = imagePath.substring(6); // Remove 'public/' prefix
    }
    
    // Use process.env.PUBLIC_URL to ensure correct path in any deployment environment
    return `${process.env.PUBLIC_URL}${imagePath}`;
  }
  
  // Fallback to placeholder images
  const questionText = question.question.toLowerCase();
  if (questionText.includes('player') || questionText.includes('messi') || questionText.includes('ronaldo')) {
    return defaultImages.player;
  } else if (questionText.includes('team') || questionText.includes('country') || questionText.includes('club')) {
    return defaultImages.team;
  } else if (questionText.includes('ball')) {
    return defaultImages.ball;
  } else {
    return defaultImages.general;
  }
};

const FootballQuiz = () => {
  const { theme } = useTheme();
  const certificateRef = useRef(null);
  
  // User Info States
  const [userName, setUserName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showQuizSetup, setShowQuizSetup] = useState(true);
  
  // Quiz Status States
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [answerStatus, setAnswerStatus] = useState(null);
  
  // Timer State
  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  
  // Results States
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [earlyExit, setEarlyExit] = useState(false);
  
  // Load questions based on selected difficulty
  useEffect(() => {
    if (difficulty && quizStarted) {
      setQuestions(quizData[difficulty] || []);
      setTimerActive(true);
    }
  }, [difficulty, quizStarted]);
  
  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0 && !answerStatus) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && timerActive && !answerStatus) {
      // Time's up, handle as if skipped
      handleTimeUp();
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timer, answerStatus]);
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (quizStarted) {
      setTimer(15);
    }
  }, [currentQuestionIndex, quizStarted]);

  const startQuiz = () => {
    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }
    
    if (!difficulty) {
      alert('Please select a difficulty level.');
      return;
    }
    
    setShowQuizSetup(false);
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answer) => {
    if (answerStatus) return; // Prevent changing answer after submission
    setSelectedAnswer(answer);
  };
  
  const handleTimeUp = () => {
    const question = questions[currentQuestionIndex];
    
    // Record as incorrect/skipped
    setIncorrectAnswers(prev => prev + 1);
    setUserAnswers(prev => [
      ...prev, 
      {
        question: question.question,
        userAnswer: 'Time expired',
        correctAnswer: question.answer,
        isCorrect: false,
        timeExpired: true
      }
    ]);
    
    setAnswerStatus('timeout');
    
    // Auto-proceed after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        nextQuestion();
      } else {
        endQuiz();
      }
    }, 1500);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || answerStatus) return;
    
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.answer;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setCorrectAnswers(prev => prev + 1);
      setAnswerStatus('correct');
    } else {
      setIncorrectAnswers(prev => prev + 1);
      setAnswerStatus('incorrect');
    }
    
    // Store the user's answer
    setUserAnswers(prev => [
      ...prev, 
      {
        question: question.question,
        userAnswer: selectedAnswer,
        correctAnswer: question.answer,
        isCorrect
      }
    ]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer('');
      setAnswerStatus(null);
      setTimer(15); // Reset timer for next question
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    setQuizEnded(true);
    setTimerActive(false);
  };

  const handleEndQuizEarly = () => {
    // Add remaining questions as unattempted
    const remainingQuestions = questions.slice(currentQuestionIndex + (answerStatus ? 1 : 0));
    
    // If there's a current question that hasn't been answered yet
    if (!answerStatus && currentQuestionIndex < questions.length) {
      setIncorrectAnswers(prev => prev + 1);
      setUserAnswers(prev => [
        ...prev, 
        {
          question: questions[currentQuestionIndex].question,
          userAnswer: 'Skipped',
          correctAnswer: questions[currentQuestionIndex].answer,
          isCorrect: false,
          skipped: true
        }
      ]);
    }
    
    // Mark remaining questions as skipped
    if (remainingQuestions.length > 0) {
      const skippedAnswers = remainingQuestions.map(question => ({
        question: question.question,
        userAnswer: 'Not attempted',
        correctAnswer: question.answer,
        isCorrect: false,
        skipped: true
      }));
      
      setUserAnswers(prev => [...prev, ...skippedAnswers]);
      setIncorrectAnswers(prev => prev + remainingQuestions.length);
    }
    
    setEarlyExit(true);
    endQuiz();
  };

  const downloadResults = () => {
    if (!certificateRef.current) return;
    
    // Hide the answer review and action buttons temporarily
    const answerReview = certificateRef.current.querySelector('.answer-review');
    const resultsActions = certificateRef.current.querySelector('.results-actions');
    const earlyExitNote = certificateRef.current.querySelector('.early-exit-note');
    
    if (answerReview) answerReview.style.display = 'none';
    if (resultsActions) resultsActions.style.display = 'none';
    if (earlyExitNote) earlyExitNote.style.display = 'none';
    
    const scale = 2; // Optimal scale factor for clarity
    const element = certificateRef.current;
    const originalWidth = element.offsetWidth;
    const originalHeight = element.offsetHeight;
    
    html2canvas(element, {
      backgroundColor: '#0f172a',
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: originalWidth,
      height: originalHeight,
      windowWidth: originalWidth,
      windowHeight: originalHeight,
      x: 0,
      y: 0,
      imageTimeout: 15000,
      pixelRatio: 2,
      onclone: (clonedDoc) => {
        // Enhance the certificate styling in the cloned document
        const clonedElement = clonedDoc.getElementById(certificateRef.current.id);
        if (clonedElement) {
          clonedElement.style.padding = '40px';
          clonedElement.style.background = 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.98))';
          clonedElement.style.borderRadius = '20px';
          clonedElement.style.border = '2px solid rgba(96, 165, 250, 0.3)';
          
          // Ensure text is rendered crisply
          clonedElement.style.textRendering = 'optimizeLegibility';
          clonedElement.style.webkitFontSmoothing = 'antialiased';
          clonedElement.style.mozOsxFontSmoothing = 'grayscale';
          
          // Enhance text elements for better clarity
          const textElements = clonedElement.querySelectorAll('h1, h2, h3, p, span, div');
          textElements.forEach(el => {
            el.style.textRendering = 'optimizeLegibility';
            el.style.webkitFontSmoothing = 'antialiased';
            el.style.mozOsxFontSmoothing = 'grayscale';
          });
          
          // Add a subtle watermark
          const watermark = clonedDoc.createElement('div');
          watermark.style.position = 'absolute';
          watermark.style.bottom = '20px';
          watermark.style.right = '20px';
          watermark.style.fontSize = '12px';
          watermark.style.color = 'rgba(255, 255, 255, 0.3)';
          watermark.style.textRendering = 'optimizeLegibility';
          watermark.textContent = 'Football Quiz Certificate';
          clonedElement.appendChild(watermark);
        }
      }
    }).then(canvas => {
      // Create a new canvas with double the dimensions for higher quality
      const scaledCanvas = document.createElement('canvas');
      const ctx = scaledCanvas.getContext('2d');
      scaledCanvas.width = canvas.width * 2;
      scaledCanvas.height = canvas.height * 2;
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the original canvas onto the scaled canvas
      ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      
      // Get the high-quality image data
      const imgData = scaledCanvas.toDataURL('image/png', 1.0);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.download = `${userName}_FootballQuiz_Certificate.png`;
      link.href = imgData;
      link.click();
      
      // Restore the hidden elements
      if (answerReview) answerReview.style.display = 'block';
      if (resultsActions) resultsActions.style.display = 'flex';
      if (earlyExitNote) earlyExitNote.style.display = 'block';
    }).catch(err => {
      console.error("Error generating certificate:", err);
      alert("There was an error generating your certificate. Please try again.");
      
      // Restore the hidden elements in case of error
      if (answerReview) answerReview.style.display = 'block';
      if (resultsActions) resultsActions.style.display = 'flex';
      if (earlyExitNote) earlyExitNote.style.display = 'block';
    });
  };
  
  const calculatePercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round((score / questions.length) * 100);
  };

  const restartQuiz = () => {
    setShowQuizSetup(true);
    setQuizStarted(false);
    setQuizEnded(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setUserAnswers([]);
    setAnswerStatus(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setTimer(15);
    setTimerActive(false);
  };

  // Get expertise level based on score percentage
  const getExpertiseLevel = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) return "Football Expert";
    if (percentage >= 75) return "Football Pro";
    if (percentage >= 60) return "Football Enthusiast";
    if (percentage >= 40) return "Football Fan";
    return "Football Beginner";
  };

  return (
    <div className="football-quiz-container">
      {showQuizSetup && (
        <div className="quiz-setup-card">
          <h1 className="quiz-title">FOOTBALL <span className="quiz-blue-text">QUIZ</span></h1>
          
          <p className="quiz-intro">
            Test your football knowledge with our interactive quiz. Choose your difficulty level and see how well you know the beautiful game!
          </p>
          
          <div className="user-info-form">
            <div className="form-group">
              <label htmlFor="userName">Your Name</label>
              <input
                type="text"
                id="userName"
                className="quiz-input"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Select Difficulty</label>
              <div className="difficulty-options">
                <button 
                  className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  Easy
                </button>
                <button 
                  className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  Medium
                </button>
                <button 
                  className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  Hard
                </button>
              </div>
            </div>
            
            <button className="quiz-start-btn" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {quizStarted && !quizEnded && questions.length > 0 && (
        <div className="quiz-question-card">
          <div className="quiz-header">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            
            <div className={`quiz-timer ${timer <= 5 ? 'low-time' : ''}`}>
              <ClockIcon size={18} />
              <span>{timer}s</span>
            </div>
          </div>
          
          <div className="question-content">
            <h2 className="question-text">{questions[currentQuestionIndex].question}</h2>
            
            <div className="question-image-container">
              <img 
                src={getQuizImage(questions[currentQuestionIndex])}
                alt="Quiz Question"
                className="question-image"
              />
            </div>
            
            <div className="answer-options">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${selectedAnswer === option ? 'selected' : ''} 
                    ${answerStatus && option === questions[currentQuestionIndex].answer ? 'correct' : ''}
                    ${answerStatus === 'incorrect' && selectedAnswer === option ? 'incorrect' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={answerStatus !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {answerStatus === 'correct' && (
              <div className="answer-feedback correct">
                <CheckCircleIcon size={20} /> Correct! Well done!
              </div>
            )}
            
            {answerStatus === 'incorrect' && (
              <div className="answer-feedback incorrect">
                <XCircleIcon size={20} /> Incorrect. The correct answer is: {questions[currentQuestionIndex].answer}
              </div>
            )}
            
            {answerStatus === 'timeout' && (
              <div className="answer-feedback timeout">
                <ClockIcon size={20} /> Time's up! The correct answer is: {questions[currentQuestionIndex].answer}
              </div>
            )}
            
            <div className="question-actions">
              {!answerStatus ? (
                <>
                  <button 
                    className="submit-answer-btn" 
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                  >
                    Submit Answer
                  </button>
                  <button 
                    className="end-quiz-early-btn"
                    onClick={() => {
                      setEarlyExit(true);
                      endQuiz();
                    }}
                  >
                    End Quiz
                  </button>
                </>
              ) : (
                <button 
                  className="next-question-btn" 
                  onClick={nextQuestion}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {quizEnded && (
        <div className="quiz-results-card" ref={certificateRef}>
          <div className="quiz-results-header">
            <h1>Quiz <span>Results</span></h1>
          </div>
          
          <div className="user-quiz-info">
            <div className="user-name">{userName}</div>
            <div className="quiz-difficulty">
              Difficulty: <span>{difficulty}</span>
            </div>
          </div>
          
          <div className="results-summary">
            <div className="result-score-visual">
              <div className="progress-circle-container">
                <CircularProgressbar
                  value={calculatePercentage()}
                  text={`${calculatePercentage()}%`}
                  styles={buildStyles({
                    rotation: 0,
                    strokeLinecap: 'round',
                    textSize: '16px',
                    pathTransitionDuration: 0.5,
                    pathColor: '#3b82f6',
                    textColor: '#fff',
                    trailColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#3e98c7',
                  })}
                />
              </div>
            </div>
            
            <div className="result-stats">
              <div className="stat-item stat-correct">
                <CheckCircleIcon size={20} />
                <span>Correct: {correctAnswers}</span>
              </div>
              <div className="stat-item stat-incorrect">
                <XCircleIcon size={20} />
                <span>Incorrect: {incorrectAnswers}</span>
              </div>
            </div>
          </div>
          
          <h3 className="expertise-level">Expertise Level: {getExpertiseLevel()}</h3>
          
          <div className="results-actions">
            <button className="download-results-btn" onClick={downloadResults}>
              <DownloadIcon size={20} />
              Download Results
            </button>
            <button className="restart-quiz-btn" onClick={restartQuiz}>
              <RefreshCw size={20} />
              Try Again
            </button>
          </div>
          
          <div className="answer-review">
            <h3>Question Review</h3>
            <div className="answer-list">
              {userAnswers.map((answer, index) => (
                <div 
                  key={index} 
                  className={`answer-item ${
                    answer.timeExpired ? 'timeout' : 
                    answer.isCorrect ? 'correct' : 'incorrect'
                  }`}
                >
                  <div className="question-text">{answer.question}</div>
                  <div className="answer-details">
                    <p>Your answer: <span>{answer.userAnswer}</span></p>
                    <p>Correct answer: <span>{answer.correctAnswer}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {earlyExit && (
            <div className="early-exit-note">
              Note: You ended the quiz early. Some questions were not answered.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FootballQuiz; 