# SkillSwap ⚡

A peer-to-peer student skill sharing platform built with **React (Vite)**, **Node.js (Express)**, and **MongoDB Atlas (Mongoose)**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (included with Node.js)
- A **MongoDB Atlas** database connection string (or local MongoDB)

---

### 2. Backend Setup
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and paste your MongoDB Atlas connection string and JWT secret.*
4. Start the backend server:
   ```bash
   node server.js
   ```
   *The server runs at: `http://localhost:5001`*

---

### 3. Frontend Setup
1. Open a second terminal window and navigate to `skillswap/`:
   ```bash
   cd skillswap
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser at: `http://localhost:5173`*

---

## 🌟 Key Features
- **User Authentication**: Secure registration and login with bcrypt password hashing and JWT.
- **Student Profile**: Customize bio, location, skills you can teach, and skills you want to learn.
- **Intelligent Skill Matching**: Automatically identifies campus students whose teaching skills match your desired learning goals.
- **Skill Swap Requests**: Send, accept, or reject peer learning swap invitations.
- **Learning Sessions**: Schedule 1-on-1 sessions for accepted swap requests with status tracking (Scheduled, Completed, Cancelled).
- **Interactive Dashboard**: Live metrics tracking teaching skills, wishlist skills, active matches, pending requests, and upcoming sessions.
- **Responsive UI**: Clean design with Tailwind CSS and fully functional mobile menu.
