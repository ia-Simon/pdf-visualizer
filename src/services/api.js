import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://44.225.182.230:8080/rest/services/proposta/ws,'
    baseURL: 'http://localhost:3000',
});

export default api;