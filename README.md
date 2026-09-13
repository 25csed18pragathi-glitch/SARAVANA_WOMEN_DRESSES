# Saravana Women Dresses — Full-Stack E-Commerce Application

Welcome to the **Saravana Women Dresses** e-commerce project!

---

## 📁 Project Architecture

```text
Saravana Women Dresses/
├── backend/
│   ├── src/
│   │   ├── config/            # DB configuration & external services
│   │   ├── controllers/       # Route logic & request handlers
│   │   ├── middleware/        # Authentication & validation middleware
│   │   ├── models/            # Database schemas (Mongoose)
│   │   ├── routes/            # API endpoints
│   │   │   └── health.routes.js # GET /api/health
│   │   ├── app.js             # Express application & middleware setup
│   │   └── server.js          # Server entry point (port 5000)
│   ├── .env                   # Environment configuration (PORT=5000)
│   ├── .env.example           # Template for environment variables
│   └── package.json           # Express, CORS, Dotenv dependencies
│
├── frontend/
│   ├── src/
│   │   ├── assets/            # Images, brand logos, icons
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Main application views
│   │   ├── services/          # API services
│   │   │   └── api.js         # Backend communication helpers
│   │   ├── App.jsx            # Main React component & health monitor
│   │   ├── App.css            # Component styles
│   │   ├── index.css          # Design system, palette & typography
│   │   └── main.jsx           # React root entry point
│   ├── index.html             # HTML template with Google Fonts
│   ├── package.json           # React 19, Vite dependencies
│   └── vite.config.js         # Vite configuration (port 5173 + proxy)
│
└── .gitignore                 # Root gitignore for node_modules, .env, dist
```

---

## 🚀 How to Run the Application

### 1. Run the Backend (Terminal 1)
```bash
cd backend
npm run dev
# Or: npm start
```
* The backend server will start at: **`http://localhost:5000`**
* Test the health check endpoint: **`http://localhost:5000/api/health`**

### 2. Run the Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
* The React frontend will start at: **`http://localhost:5173`**
* Open your browser and navigate to `http://localhost:5173` to see the live connection status.

> **Note for Windows PowerShell Users:** If PowerShell shows a script execution error (`PSSecurityException`), run `npm.cmd run dev` or open Command Prompt (CMD) / Git Bash.
