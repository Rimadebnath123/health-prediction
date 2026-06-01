import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import PredictionBadge from '../components/PredictionBadge';
import { Users, AlertTriangle, ShieldCheck, Activity, Eye, PlusCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard statistics. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container main-content text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary fw-medium">Loading health analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container main-content">
        <div className="alert alert-danger shadow-sm rounded-3 d-flex align-items-center gap-3" role="alert">
          <AlertTriangle size={24} />
          <div>
            <h5 className="alert-heading mb-1 fw-bold">Connection Error</h5>
            <p className="mb-0">{error}</p>
            <button className="btn btn-outline-danger btn-sm mt-3" onClick={fetchStats}>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { total_patients, high_risk_patients, moderate_risk_patients, low_risk_patients, recent_predictions } = stats || {
    total_patients: 0,
    high_risk_patients: 0,
    moderate_risk_patients: 0,
    low_risk_patients: 0,
    recent_predictions: []
  };

  return (
    <div className="container main-content fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-dark mb-1">Health Analytics</h1>
          <p className="text-secondary mb-0">Overview of patient registrations and risk classification</p>
        </div>
        <Link to="/add" className="btn btn-primary d-flex align-items-center gap-2 btn-animate rounded-3 px-3 py-2">
          <PlusCircle size={18} />
          <span>Register Patient</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        {/* Total Patients */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                <Users size={24} />
              </div>
              <span className="badge bg-light text-primary border border-primary border-opacity-10 rounded-pill px-2.5 py-1 text-xs font-semibold">Total</span>
            </div>
            <h2 className="fw-bold text-dark mb-1">{total_patients}</h2>
            <p className="text-secondary mb-0 fw-medium">Registered Patients</p>
          </div>
        </div>

        {/* High Risk */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card p-4 border-start border-danger border-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger">
                <AlertTriangle size={24} />
              </div>
              <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 py-1 text-xs font-semibold">Critical</span>
            </div>
            <h2 className="fw-bold text-dark mb-1">{high_risk_patients}</h2>
            <p className="text-secondary mb-0 fw-medium">High Risk Patients</p>
          </div>
        </div>

        {/* Moderate Risk */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card p-4 border-start border-warning border-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning">
                <Activity size={24} />
              </div>
              <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2.5 py-1 text-xs font-semibold">Warning</span>
            </div>
            <h2 className="fw-bold text-dark mb-1">{moderate_risk_patients}</h2>
            <p className="text-secondary mb-0 fw-medium">Moderate Risk Patients</p>
          </div>
        </div>

        {/* Low Risk */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card p-4 border-start border-success border-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success">
                <ShieldCheck size={24} />
              </div>
              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 text-xs font-semibold">Stable</span>
            </div>
            <h2 className="fw-bold text-dark mb-1">{low_risk_patients}</h2>
            <p className="text-secondary mb-0 fw-medium">Low Risk Patients</p>
          </div>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1">Recent Predictions</h3>
            <p className="text-secondary mb-0">The 5 most recently evaluated patients</p>
          </div>
          <Link to="/patients" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 rounded-3 px-3 py-2 btn-animate">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recent_predictions.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <Activity className="mx-auto mb-3 text-muted" size={40} />
            <p className="mb-0 fw-medium">No patient records found.</p>
            <p className="text-muted text-sm">Register a new patient to see analytics here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table table-hover align-middle">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Glucose (mg/dL)</th>
                  <th scope="col">Hb (g/dL)</th>
                  <th scope="col">Cholesterol (mg/dL)</th>
                  <th scope="col">Prediction</th>
                  <th scope="col" className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent_predictions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="fw-bold text-dark">{p.full_name}</span>
                    </td>
                    <td>
                      <span className="text-secondary">{p.email}</span>
                    </td>
                    <td>
                      <span className="fw-medium">{p.glucose}</span>
                    </td>
                    <td>
                      <span className="fw-medium">{p.haemoglobin}</span>
                    </td>
                    <td>
                      <span className="fw-medium">{p.cholesterol}</span>
                    </td>
                    <td>
                      <PredictionBadge result={p.prediction_result} />
                    </td>
                    <td className="text-center">
                      <Link to={`/patients/${p.id}`} className="btn btn-light btn-sm text-primary rounded-3 border-0 btn-animate" title="View details">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
