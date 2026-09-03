import { useState } from 'react';
import './assets/fonts/fonts.css';
import './App.css';

import { Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/home';
import Exercises from './pages/exercises';
import Exercise from './pages/exercise';
import Error from './pages/error';

function App() {
  return (
    <>
      <div className="app-shell">
        <div className="container nav-mt" />
        <Navbar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exercises" element={<Exercises />} />
            {/*:slug : è una variabile che permette di aprire un path diverso */}
            <Route path="/exercise/:sectionId" element={<Exercise />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
