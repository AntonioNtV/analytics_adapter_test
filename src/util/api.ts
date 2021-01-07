import axios from 'axios';

const api = axios.create({
    baseURL: 'https://analytics.es.bm3.elife.com.br',
    auth: {
        username: 'user',
        password: 'pass',
    },
});

export default api;
