# Annapurna - Community Food Redistribution Platform

Annapurna is a comprehensive full-stack platform designed to bridge the gap between food surplus and food scarcity. It connects food donors (restaurants, individuals, events) with orphanages, NGOs, and volunteers to ensure that no meal goes to waste.

## 🚀 Features

- **Role-Based Access**: Specialized interfaces for Donors, Volunteers, NGOs/Orphanages, and Administrators.
- **Real-time Tracking**: Interactive maps using Leaflet to track donation deliveries in real-time.
- **Smart Notifications**: Instant updates via Socket.io for donation requests, status changes, and community alerts.
- **Social Integration**: A community feed for sharing impact stories and updates.
- **Admin Dashboard**: Comprehensive tools for managing users, verifying donations, and monitoring platform metrics.
- **Media Uploads**: Secure image uploading for donation verification using Multer.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **State Management**: React Context API
- **Real-time**: [Socket.io-client](https://socket.io/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) & Bcryptjs
- **File Handling**: Multer
- **Real-time**: Socket.io

## 📁 Project Structure

```text
FSD_MP/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Context providers (Auth, Socket)
│   │   ├── pages/     # Page-level components
│   │   └── utils/     # API and helper functions
├── backend/           # Node.js + Express backend API
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth and utility middleware
│   └── index.js       # Server entry point
└── .gitignore         # Git ignore configuration
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` root:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
