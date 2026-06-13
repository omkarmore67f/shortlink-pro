# 🔗 ShortLink Pro

A full-stack URL Shortener built using the MERN Stack. Users can create short URLs, manage links, generate QR codes, and track click analytics through a modern dashboard.

## 🚀 Live Demo

Frontend: https://your-frontend-url

Backend: https://your-backend-url

---

## 📸 Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Create Short Link

![Create Link](./screenshots/create-link.png)

### Analytics Dashboard

![Analytics](./screenshots/analytics.png)

---

## ✨ Features

### Authentication

* User Registration & Login
* JWT Authentication
* Protected Routes
* Profile Management

### URL Management

* Create Short URLs
* Custom Aliases
* Edit & Delete Links
* Link Expiration Support
* Enable/Disable Links

### Analytics

* Total Click Tracking
* Top Performing Links
* Recent Activity
* Device & Browser Statistics
* Click Trend Charts

### QR Code Generation

* Auto-generated QR Codes
* Download QR Code as PNG

### Security

* Password Hashing with bcrypt
* JWT Authorization
* Rate Limiting
* Input Validation
* Helmet Security Headers
* NoSQL Injection Protection

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts

### Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Mongoose

### Database

* MongoDB Atlas

### DevOps

* Docker
* Docker Compose
* Nginx

---

## 🏗️ Project Structure

```text
shortlink-pro
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── src
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/shortlink-pro.git
cd shortlink-pro
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---
## 🚀 Live Demo

🔗 Live Application: https://shortlink-pro.onrender.com/

## 🔑 Environment Variables

### Backend

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📊 Key Highlights

* Full MERN Stack Application
* JWT-Based Authentication
* QR Code Integration
* Analytics Dashboard
* Responsive UI
* Dockerized Deployment
* Production-Ready Architecture

---

## 🎯 Future Improvements

* Redis Caching
* Team Workspaces
* Password Reset
* Email Verification
* Geo-location Analytics
* Premium Subscription Plans

---

## 👨‍💻 Author

Omkar More

Final Year CSE Student | MERN Developer | Aspiring Cloud Engineer
