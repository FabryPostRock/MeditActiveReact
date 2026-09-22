import { useState } from 'react';
import './assets/fonts/fonts.css';
import './App.css';

import { Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/home';
import Exercises from './pages/exercises';
import Exercise from './pages/exercise';
import Error from './pages/error';
import { PerspectiveWalls } from './components/perspectiveWalls';
import { Footer } from './components/footer';
import { CursorWake } from './components/cursorWake';

function App() {
  return (
    <>
      <div className="app-shell">
        <div className="container nav-mt" />
        <Navbar />
        <main className="page-scroll-container">
          <div className="page-isolation">
            <PerspectiveWalls />
            <CursorWake />

            <div className="page__content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exercises" element={<Exercises />} />
                {/*:sectionId : a variable that allow to open a diffrent path */}
                <Route path="/exercise/:sectionId" element={<Exercise />} />
                <Route path="*" element={<Error />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
