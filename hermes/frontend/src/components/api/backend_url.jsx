// src/components/backend_url.jsx

const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
};

export default config;
