# SolarNode IoT Dashboard

SolarNode is a full-stack IoT power management system designed to monitor and control off-grid solar inverters. It features a React-based frontend with a cyberpunk aesthetic, a Node.js/Express backend, and ESP32 hardware integration for real-time telemetry and relay control.

## Project Overview

This system allows users to:
- Monitor real-time battery voltage and current draw.
- View calculated battery capacity for 3S Li-Ion configurations.
- Remotely toggle the inverter relay (Battery vs. Grid mode).
- Track system history and activity logs.
- Manage access with a secure JWT-based authentication system.

## Technology Stack

- **Frontend:** React, Tailwind CSS, Recharts, Lucide React (Vite build tool)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Hardware:** ESP32 (Arduino framework) with voltage/current sensors
- **Authentication:** JWT (JSON Web Tokens)

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### Backend Setup

1. Navigate to the server directory:
   cd server

2. Install dependencies:
   npm install

3. Configure environment variables (.env):
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/solarnode
   JWT_SECRET=your_secure_secret_here
   CORS_ORIGIN=http://localhost:5173

4. Start the server:
   node server.js

### Frontend Setup

1. Navigate to the project root:
   cd ..

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

The application will be available at http://localhost:5173.

## Deployment

### Backend (Render/Heroku/Railway)

1. Set the Root Directory to "server".
2. Set the Build Command to "npm install".
3. Set the Start Command to "node server.js".
4. Add environment variables (MONGODB_URI, JWT_SECRET, CORS_ORIGIN).

### Frontend (Vercel/Netlify)

1. Set the Root Directory to "." (project root).
2. Set the Build Command to "vite build".
3. Set the Output Directory to "dist".
4. Configure the API URL to point to your deployed backend.

## API Documentation

The backend exposes the following endpoints:

- GET /api/dashboard - Retrieve live telemetry and system state
- POST /api/control - Toggle inverter relay state
- POST /api/telemetry - Endpoint for ESP32 data ingestion
- POST /api/auth/login - User authentication

## License

This project is open source and available for personal and educational use.