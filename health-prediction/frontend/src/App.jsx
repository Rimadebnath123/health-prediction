import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import AddPatient from './pages/AddPatient';
import PatientDetail from './pages/PatientDetail';
import EditPatient from './pages/EditPatient';

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/add" element={<AddPatient />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/edit/:id" element={<EditPatient />} />
          </Routes>
        </main>
        <footer className="bg-white border-top py-3 mt-auto text-center text-secondary fs-7">
          <div className="container">
            <span>&copy; {new Date().getFullYear()} HealthPredict AI. All rights reserved. For diagnostic assistance.</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

