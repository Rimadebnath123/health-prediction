import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Users, UserPlus } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active text-primary fw-semibold' : 'text-secondary';
  };

  return (
    <nav className="navbar navbar-expand-lg glass-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-primary fw-bold" to="/">
          <Activity className="stroke-2" size={24} />
          <span>HealthPredict AI</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-2 mt-2 mt-lg-0">
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center gap-2 ${isActive('/')}`} to="/">
                <Activity size={18} />
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center gap-2 ${isActive('/patients')}`} to="/patients">
                <Users size={18} />
                Patient Directory
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center gap-2 ${isActive('/add')}`} to="/add">
                <UserPlus size={18} />
                Register Patient
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
