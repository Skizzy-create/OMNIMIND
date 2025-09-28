import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './PresentationApp.css';

// Slide Components
import CoverSlide from './slides/CoverSlide';
import ProblemSlide from './slides/ProblemSlide';
import SolutionSlide from './slides/SolutionSlide';
import BusinessModelSlide from './slides/BusinessModelSlide';
import GrowthSlide from './slides/GrowthSlide';

interface Slide {
  id: string;
  path: string;
  component: React.ComponentType;
  title: string;
}

const slides: Slide[] = [
  { id: 'cover', path: '/', component: CoverSlide, title: 'Cover' },
  { id: 'problem', path: '/problem', component: ProblemSlide, title: 'The Problem' },
  { id: 'solution', path: '/solution', component: SolutionSlide, title: 'The Solution' },
  { id: 'business', path: '/business', component: BusinessModelSlide, title: 'Business Model' },
  { id: 'growth', path: '/growth', component: GrowthSlide, title: 'Growth & Vision' },
];

const PresentationNavigator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const index = slides.findIndex(slide => slide.path === currentPath);
    if (index !== -1) {
      setCurrentSlideIndex(index);
    }
  }, [location.pathname]);

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      const prevSlide = slides[currentSlideIndex - 1];
      navigate(prevSlide.path);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextSlide = slides[currentSlideIndex + 1];
      navigate(nextSlide.path);
    }
  };

  const goToSlide = (index: number) => {
    navigate(slides[index].path);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (event.key === 'ArrowRight') {
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex]);

  return (
    <div className="presentation-container">
      {/* Navigation Header */}
     

      {/* Arrow Navigation */}
      <button
        className={`nav-arrow nav-arrow-left ${currentSlideIndex === 0 ? 'disabled' : ''}`}
        onClick={goToPreviousSlide}
        disabled={currentSlideIndex === 0}
        title="Previous Slide (←)"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        className={`nav-arrow nav-arrow-right ${currentSlideIndex === slides.length - 1 ? 'disabled' : ''}`}
        onClick={goToNextSlide}
        disabled={currentSlideIndex === slides.length - 1}
        title="Next Slide (→)"
      >
        <ChevronRight size={32} />
      </button>

      {/* Slide Content */}
      <div className="slide-content">
        <Routes>
          <Route path="/" element={<CoverSlide />} />
          <Route path="/problem" element={<ProblemSlide />} />
          <Route path="/solution" element={<SolutionSlide />} />
          <Route path="/business" element={<BusinessModelSlide />} />
          <Route path="/growth" element={<GrowthSlide />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const PresentationApp: React.FC = () => {
  return (
    <Router>
      <div className="presentation-app">
        <PresentationNavigator />
      </div>
    </Router>
  );
};

export default PresentationApp;
