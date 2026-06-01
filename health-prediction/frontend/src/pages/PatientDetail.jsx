import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPatient, deletePatient } from '../services/api';
import PredictionBadge from '../components/PredictionBadge';
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Clock, 
  Activity, 
  Trash2, 
  Edit, 
  AlertTriangle,
  User,
  Heart,
  Droplet,
  Compass
} from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const data = await getPatient(id);
      setPatient(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Patient record not found or server is offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handleDelete = async () => {
    if (patient && window.confirm(`Are you sure you want to delete patient logs for "${patient.full_name}"?`)) {
      try {
        await deletePatient(patient.id);
        navigate('/patients');
      } catch (err) {
        console.error(err);
        alert('Failed to delete patient record.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container main-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Loading diagnosis report...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container main-content">
        <div className="alert alert-danger shadow-sm rounded-3 d-flex align-items-center gap-3" role="alert">
          <AlertTriangle size={24} />
          <div>
            <h5 className="alert-heading mb-1 fw-bold">Report Error</h5>
            <p className="mb-0">{error || 'Unable to retrieve report.'}</p>
            <Link to="/patients" className="btn btn-outline-danger btn-sm mt-3">
              Return to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format Dates
  const formattedDOB = new Date(patient.date_of_birth).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedCreated = new Date(patient.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getRiskBannerStyle = (risk) => {
    switch (risk) {
      case 0:
        return 'border-success bg-success bg-opacity-10 text-success';
      case 1:
        return 'border-warning bg-warning bg-opacity-10 text-warning';
      case 2:
        return 'border-danger bg-danger bg-opacity-10 text-danger';
      default:
        return 'border-secondary bg-light';
    }
  };

  return (
    <div className="container main-content fade-in">
      {/* Navigation Headers */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/patients" className="text-decoration-none text-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </Link>
        
        <div className="d-flex gap-2">
          <Link to={`/edit/${patient.id}`} className="btn btn-outline-warning rounded-3 px-3 py-2 btn-animate d-flex align-items-center gap-1.5">
            <Edit size={16} />
            <span>Edit Report</span>
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger rounded-3 px-3 py-2 btn-danger-animate d-flex align-items-center gap-1.5">
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="detail-grid">
        {/* Left Side: Diagnostics and Lab Values */}
        <div>
          {/* Patient Header Details */}
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-4 mb-4">
              <div className="bg-primary bg-opacity-10 p-3.5 rounded-4 text-primary d-none d-sm-block">
                <User size={38} />
              </div>
              <div>
                <span className="text-secondary fw-semibold text-uppercase tracking-wider fs-7">Patient Demographics</span>
                <h2 className="fw-bold text-dark mt-1 mb-2">{patient.full_name}</h2>
                <div className="d-flex flex-wrap gap-x-4 gap-y-2 text-secondary fs-6">
                  <span className="d-flex align-items-center gap-1">
                    <Calendar size={16} />
                    DOB: {formattedDOB}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <Mail size={16} />
                    {patient.email}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="row g-3 pt-3 border-top text-secondary fs-7">
              <div className="col-12 col-sm-6 d-flex align-items-center gap-1.5">
                <Clock size={14} />
                <span>Registered: {formattedCreated}</span>
              </div>
            </div>
          </div>

          {/* Blood test values */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <Activity className="text-primary" size={22} />
              Biometric Lab Panels
            </h4>
            
            <div className="row g-4">
              {/* Glucose */}
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 text-center bg-light scale-hover">
                  <div className="bg-primary bg-opacity-10 text-primary p-2.5 rounded-circle d-inline-block mb-2">
                    <Droplet size={20} />
                  </div>
                  <h6 className="text-secondary fw-semibold mb-1">Fasting Glucose</h6>
                  <h3 className="fw-bold text-dark mb-1">{patient.glucose}</h3>
                  <span className="text-muted fs-7">mg/dL</span>
                  <div className="mt-3 fs-8 text-secondary border-top pt-2">
                    Ref: 70 - 100 mg/dL
                  </div>
                </div>
              </div>

              {/* Haemoglobin */}
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 text-center bg-light scale-hover">
                  <div className="bg-danger bg-opacity-10 text-danger p-2.5 rounded-circle d-inline-block mb-2">
                    <Heart size={20} />
                  </div>
                  <h6 className="text-secondary fw-semibold mb-1">Haemoglobin</h6>
                  <h3 className="fw-bold text-dark mb-1">{patient.haemoglobin}</h3>
                  <span className="text-muted fs-7">g/dL</span>
                  <div className="mt-3 fs-8 text-secondary border-top pt-2">
                    Ref: 12 - 17 g/dL
                  </div>
                </div>
              </div>

              {/* Cholesterol */}
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded-3 text-center bg-light scale-hover">
                  <div className="bg-warning bg-opacity-10 text-warning p-2.5 rounded-circle d-inline-block mb-2">
                    <Compass size={20} />
                  </div>
                  <h6 className="text-secondary fw-semibold mb-1">Total Cholesterol</h6>
                  <h3 className="fw-bold text-dark mb-1">{patient.cholesterol}</h3>
                  <span className="text-muted fs-7">mg/dL</span>
                  <div className="mt-3 fs-8 text-secondary border-top pt-2">
                    Ref: &lt; 200 mg/dL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Prediction Summary */}
        <div>
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h4 className="fw-bold text-dark mb-3">AI Risk Assessment</h4>
            <hr className="mt-0 mb-3" />
            
            <div className="text-center py-4 mb-4 rounded-3 border-2 border border-dashed d-flex flex-column align-items-center justify-content-center">
              <span className="text-secondary fw-semibold fs-7 mb-2">Predicted Health Class</span>
              <PredictionBadge result={patient.prediction_result} />
            </div>

            {/* Diagnostic Remarks Banner */}
            <div className={`p-4 border-start border-4 rounded-3 mb-2 ${getRiskBannerStyle(patient.prediction_result)}`}>
              <h6 className="fw-bold mb-2">Clinical Insights & Remarks:</h6>
              <p className="mb-0 fs-6 fw-medium leading-relaxed">{patient.remarks}</p>
            </div>
            
            <div className="mt-4 p-3 bg-light rounded-3 text-secondary fs-8">
              <strong>Disclaimer:</strong> Predictions generated are powered by a custom Machine Learning Decision Classifier. These findings are for diagnostics screening aids and do not substitute professional medical consultations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
