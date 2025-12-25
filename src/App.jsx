import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WeeklyReadingPage from './pages/WeeklyReadingPage'
import ParserTestBench from './pages/ParserTestBench'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Router basename="/bible-reading-companion">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weekly" element={<WeeklyReadingPage />} />
        <Route path="/test-parser" element={<ParserTestBench />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  )
}

export default App
