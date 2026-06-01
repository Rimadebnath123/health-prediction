import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatient, updatePatient } from '../services/api';
import { ArrowLeft, Save, FileText, Activity, AlertTriangle } from 'lucide-react';

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    email: '',
    glucose: '',
    haemoglobin: '',
    cholesterol: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const data = await getPatient(id);
        // Map data to form fields
        setFormData({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          email: data.email,
          glucose: data.glucose.toString(),
          haemoglobin: data.haemoglobin.toString(),
          cholesterol: data.cholesterol.toString(),
        });
        setError('');
      } catch (err) {
        console.error(err);
        setServerError('Failed to fetch patient records.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const selectedDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    const validateVitals = (value, name, displayName) => {
      if (value === '') {
        newErrors[name] = `${displayName} is required`;
      } else {
        const num = parseFloat(value);
        if (isNaN(num)) {
          newErrors[name] = `${displayName} must be a number`;
        } else if (num <= 0) {
          newErrors[name] = `${displayName} must be a positive number`;
        }
      }
    };

    validateVitals(formData.glucose, 'glucose', 'Glucose');
    validateVitals(formData.haemoglobin, 'haemoglobin', 'Haemoglobin');
    validateVitals(formData.cholesterol, 'cholesterol', 'Cholesterol');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setServerError('');
      
      const payload = {
        ...formData,
        glucose: parseFloat(formData.glucose),
        haemoglobin: parseFloat(formData.haemoglobin),
        cholesterol: parseFloat(formData.cholesterol),
      };

      await updatePatient(id, payload);
      navigate(`/patients/${id}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          const serverValidationErrors = {};
          Object.keys(err.response.data).forEach((key) => {
            serverValidationErrors[key] = Array.isArray(err.response.data[key])
              ? err.response.data[key][0]
              : err.response.data[key];
          });
          setErrors(serverValidationErrors);
        } else {
          setServerError('Failed to update patient records.');
        }
      } else {
        setServerError('Server is unreachable. Check your network.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container main-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Retrieving records for modification...</p>
      </div>
    );
  }

  return (
    <div className="container main-content fade-in">
      <div className="mb-4">
        <Link to={`/patients/${id}`} className="text-decoration-none text-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Diagnosis Report</span>
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning">
                <Activity size={28} />
              </div>
              <div>
                <h2 className="fw-bold text-dark mb-1">Edit Diagnosis Records</h2>
                <p className="text-secondary mb-0">Modify patient metrics and re-run decision models</p>
              </div>
            </div>

            {serverError && (
              <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2" role="alert">
                <AlertTriangle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Demographics */}
              <h5 className="fw-bold text-secondary border-bottom pb-2 mb-4 d-flex align-items-center gap-2">
                <FileText size={18} />
                Demographics
              </h5>

              <div className="row g-3 mb-4">
                {/* Full Name */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="full_name" className="form-label fw-semibold text-dark">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`form-control custom-input ${errors.full_name ? 'is-invalid' : ''}`}
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.full_name && <div className="invalid-feedback fw-medium">{errors.full_name}</div>}
                </div>

                {/* Email */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="email" className="form-label fw-semibold text-dark">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control custom-input ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <div className="invalid-feedback fw-medium">{errors.email}</div>}
                </div>

                {/* DOB */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="date_of_birth" className="form-label fw-semibold text-dark">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className={`form-control custom-input ${errors.date_of_birth ? 'is-invalid' : ''}`}
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                  {errors.date_of_birth && <div className="invalid-feedback fw-medium">{errors.date_of_birth}</div>}
                </div>
              </div>

              {/* Lab Values */}
              <h5 className="fw-bold text-secondary border-bottom pb-2 mb-4 d-flex align-items-center gap-2">
                <Activity size={18} />
                Lab Results (Blood Metrics)
              </h5>

              <div className="row g-3 mb-5">
                {/* Glucose */}
                <div className="col-12 col-sm-4">
                  <label htmlFor="glucose" className="form-label fw-semibold text-dark">
                    Fasting Glucose <span className="text-secondary fw-normal">(mg/dL)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={`form-control custom-input ${errors.glucose ? 'is-invalid' : ''}`}
                    id="glucose"
                    name="glucose"
                    value={formData.glucose}
                    onChange={handleChange}
                    required
                  />
                  {errors.glucose && <div className="invalid-feedback fw-medium">{errors.glucose}</div>}
                </div>

                {/* Hb */}
                <div className="col-12 col-sm-4">
                  <label htmlFor="haemoglobin" className="form-label fw-semibold text-dark">
                    Haemoglobin <span className="text-secondary fw-normal">(g/dL)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={`form-control custom-input ${errors.haemoglobin ? 'is-invalid' : ''}`}
                    id="haemoglobin"
                    name="haemoglobin"
                    value={formData.haemoglobin}
                    onChange={handleChange}
                    required
                  />
                  {errors.haemoglobin && <div className="invalid-feedback fw-medium">{errors.haemoglobin}</div>}
                </div>

                {/* Cholesterol */}
                <div className="col-12 col-sm-4">
                  <label htmlFor="cholesterol" className="form-label fw-semibold text-dark">
                    Total Cholesterol <span className="text-secondary fw-normal">(mg/dL)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={`form-control custom-input ${errors.cholesterol ? 'is-invalid' : ''}`}
                    id="cholesterol"
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleChange}
                    required
                  />
                  {errors.cholesterol && <div className="invalid-feedback fw-medium">{errors.cholesterol}</div>}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="d-flex justify-content-end gap-3 border-top pt-4">
                <Link to={`/patients/${id}`} className="btn btn-outline-secondary rounded-3 px-4 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary rounded-3 px-4 py-2 btn-animate d-flex align-items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Saving Updates...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save & Re-predict</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatient;
