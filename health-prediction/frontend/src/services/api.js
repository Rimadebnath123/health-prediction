import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPatients = async (page = 1, search = '', ordering = '') => {
  let url = `/patients/?page=${page}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (ordering) {
    url += `&ordering=${encodeURIComponent(ordering)}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getPatient = async (id) => {
  const response = await api.get(`/patients/${id}/`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await api.post('/patients/', patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await api.put(`/patients/${id}/`, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await api.delete(`/patients/${id}/`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/patients/stats/');
  return response.data;
};

export const predictRiskStandalone = async (bloodData) => {
  const response = await api.post('/predict/', bloodData);
  return response.data;
};

export default {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getDashboardStats,
  predictRiskStandalone,
};
