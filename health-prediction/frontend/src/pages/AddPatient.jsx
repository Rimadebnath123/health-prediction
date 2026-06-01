import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPatient } from '../services/api';
import { ArrowLeft, UserPlus, FileText, Activity } from 'lucide-react';

const AddPatient = () => {
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
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of Birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const selectedDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    // Vitals validation (must be positive numbers)
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
      setLoading(true);
      setServerError('');
      
      const payload = {
        ...formData,
        glucose: parseFloat(formData.glucose),
        haemoglobin: parseFloat(formData.haemoglobin),
        cholesterol: parseFloat(formData.cholesterol),
      };

      const result = await createPatient(payload);
      // Navigate to detail page on success
      navigate(`/patients/${result.id}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        // If server returns validation errors (e.g. duplicate email)
        if (typeof err.response.data === 'object') {
          // Format errors mapping
          const serverValidationErrors = {};
          Object.keys(err.response.data).forEach((key) => {
            serverValidationErrors[key] = Array.isArray(err.response.data[key])
              ? err.response.data[key][0]
              : err.response.data[key];
          });
          setErrors(serverValidationErrors);
        } else {
          setServerError('Failed to save patient. Please check input values.');
        }
      } else {
        setServerError('Server unreachable. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content fade-in">
      <div className="mb-4">
        <Link to="/" className="text-decoration-none text-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                <UserPlus size={28} />
              </div>
              <div>
                <h2 className="fw-bold text-dark mb-1">Register New Patient</h2>
                <p className="text-secondary mb-0">Add demographics and blood panel parameters to generate risk prediction</p>
              </div>
            </div>

            {serverError && (
              <div className="alert alert-danger rounded-3" role="alert">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Demographics Section */}
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
                    placeholder="Enter full name"
                    required
                  />
                  {errors.full_name && <div className="invalid-feedback fw-medium">{errors.full_name}</div>}
                </div>

                {/* Email Address */}
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
                    placeholder="name@example.com"
                    required
                  />
                  {errors.email && <div className="invalid-feedback fw-medium">{errors.email}</div>}
                </div>

                {/* Date of Birth */}
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

              {/* Lab Results Section */}
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
                    placeholder="e.g. 95"
                    required
                  />
                  {errors.glucose && <div className="invalid-feedback fw-medium">{errors.glucose}</div>}
                </div>

                {/* Haemoglobin */}
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
                    placeholder="e.g. 14.2"
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
                    placeholder="e.g. 180"
                    required
                  />
                  {errors.cholesterol && <div className="invalid-feedback fw-medium">{errors.cholesterol}</div>}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="d-flex justify-content-end gap-3 border-top pt-4">
                <Link to="/" className="btn btn-outline-secondary rounded-3 px-4 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary rounded-3 px-4 py-2 btn-animate d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Saving Patient...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Register & Predict</span>
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

export default AddPatient;
