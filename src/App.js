import React from 'react';
import GreetingCard from './GreetingCard';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPanel from "./AdminPanel";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<GreetingCard />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
};

export default App;
