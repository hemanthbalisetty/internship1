// src/api.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: true, 
});



export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);



export const createIntegration = (data) => API.post('/integration/create', data);
export const getIntegrations = () => API.get('/integration');
export const updateIntegration = (id, data) => API.put(`/integration/update/${id}`, data);

export const createBloodEntry = (data) => API.post('/blood/create', data);
export const getBlood = () => API.get('/blood');
export const searchBlood = (params) => API.get('/blood/search', { params });


// export const createBlood = (data) => axios.post('/api/blood/create', data);
// export const requestMatch = (data) => axios.post('/api/match/request', data);

export const createBlood = (data) => API.post('/blood/create', data);
export const requestMatch = (data) => API.post('/match/request', data);

export const registerDonor = (formData) => API.post('/donors', formData);
export const getDonors = () => API.get('/donors');

// Recipients
export const registerRecipient = (formData) => API.post('/recipients', formData);
export const getRecipients = () => API.get('/recipients');

