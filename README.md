🚀 Quick - On-Demand Local Services Platform
Quick is a modern, full-stack on-demand service marketplace designed to connect clients with verified local service providers (Electricians, Plumbers, Carpenters, etc.) in real-time. The platform streamlines the process of finding, booking, and managing local home services through a seamless user interface and robust backend logic.

🛠 Tech Stack
Frontend: React.js, Tailwind CSS, Vite

Backend: Node.js, Express.js

Database: MongoDB Atlas (Mongoose ODM)

Real-time Communication: Socket.io

Authentication: JWT (JSON Web Tokens)

Maps & Location: Leaflet.js / Browser Geolocation API

✨ Core Features
Role-Based Access Control (RBAC):

Clients: Browse services, search for nearby providers using geospatial filters, and manage bookings.

Providers: Manage service profiles, set availability, and handle real-time service requests.

Admin Dashboard: Oversee platform health, monitor user statistics, and manage provider approvals/account statuses.

Geospatial Search: Utilizes MongoDB's $2dsphere indexing to calculate proximity and find providers within a specific radius.

Real-time Updates: Integrated Socket.io for instant notifications and status updates between clients and providers.

Secure Authentication: Custom middleware for JWT verification and role authorization (Admin/Provider/Client).

📂 Project Architecture
Plaintext
├── backend/
│   ├── controllers/    # Request handling & Business logic
│   ├── models/         # MongoDB Schemas (User, Service, Booking)
│   ├── routes/         # Express API Endpoints
│   ├── middleware/     # Auth Guards & Error handling
│   └── seed.js         # Database initialization script
├── frontend/
│   ├── src/
│   │   ├── context/    # Global State (Auth, Socket)
│   │   ├── components/ # Reusable UI Modules
│   │   ├── pages/      # View Components (Admin, Client, Provider)
│   │   └── api/        # Axios API instances
└── .env                # Configuration variables
⚙️ Installation & Setup
1. Clone the Repository
Bash
git clone https://github.com/your-username/quick.git
cd quick
2. Backend Configuration
Bash
cd backend
npm install
Create a .env file in the backend directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
Initialize the database (Creates default Admin and Services):

Bash
node seed.js
Start the server:

Bash
npm run dev
3. Frontend Configuration
Bash
cd frontend
npm install
npm run dev
🔑 Admin Credentials (Seeded)
Email: admin@quick.com

Password: admin123

🛡 License
This project is licensed under the MIT License.

Developed with ❤️ by Yuvraj Chaudhary
