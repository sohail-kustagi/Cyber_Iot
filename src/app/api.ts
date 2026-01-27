/**
 * API Configuration
 * 
 * Determines the base URL for API requests based on environment.
 * - In development, it points to the local Express server (port 5000)
 * - In production, it uses the VITE_API_URL environment variable
 */

// Default to local server if env var is not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const endpoints = {
    // Auth
    login: `${API_BASE_URL}/auth/login`,
    requestAccess: `${API_BASE_URL}/auth/request-access`,

    // Telemetry
    iotUpdate: `${API_BASE_URL}/iot/update`,
    dashboardLive: `${API_BASE_URL}/dashboard/live`,
    dashboardHistory: `${API_BASE_URL}/dashboard/history`,
    controlRelay: `${API_BASE_URL}/control/relay`,
    health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
