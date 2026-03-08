# TaskFlow - Scalable REST API with Authentication & Role-Based Access

A full-stack task management application built with **Node.js/Express** backend and **React** frontend, featuring JWT authentication, role-based access control (RBAC), and comprehensive CRUD operations.

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Security**: helmet, cors, express-rate-limit, hpp

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: react-icons

---

## 📁 Project Structure

```
Intern/
├── backend/
│   ├── server.js                    # Express entry point
│   ├── config/db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js                  # User model (bcrypt + JWT)
│   │   └── Task.js                  # Task model
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, Login, GetMe
│   │   ├── task.controller.js       # CRUD operations
│   │   └── admin.controller.js      # User management
│   ├── routes/v1/
│   │   ├── auth.routes.js           # Auth endpoints
│   │   ├── task.routes.js           # Task endpoints
│   │   └── admin.routes.js          # Admin endpoints
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── role.js                  # Role-based access
│   │   ├── errorHandler.js          # Global error handler
│   │   └── validate.js              # Validation wrapper
│   ├── utils/ApiError.js            # Custom error class
│   └── docs/swagger.js              # Swagger config
├── frontend/
│   ├── src/
│   │   ├── api/axios.js             # Axios with interceptors
│   │   ├── context/AuthContext.jsx   # Auth state management
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   ├── TaskCard.jsx         # Task display card
│   │   │   └── TaskForm.jsx         # Create/Edit modal
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Register page
│   │   │   ├── Dashboard.jsx        # Task dashboard
│   │   │   └── AdminPanel.jsx       # User management
│   │   ├── App.jsx                  # Router setup
│   │   └── main.jsx                 # Entry point
│   └── index.html
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** >= 16.x
- **MongoDB** running locally or MongoDB Atlas URI

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/intern_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

### 3. Run the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **API Docs (Swagger)**: http://localhost:5000/api-docs

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/me` | Get current user | Private |

### Tasks (CRUD)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/tasks` | Get all tasks (filtered) | Private |
| POST | `/api/v1/tasks` | Create task | Private |
| GET | `/api/v1/tasks/:id` | Get single task | Private |
| PUT | `/api/v1/tasks/:id` | Update task | Private |
| DELETE | `/api/v1/tasks/:id` | Delete task | Private |

### Admin
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/users` | List all users | Admin |
| GET | `/api/v1/admin/users/:id` | Get user by ID | Admin |
| PUT | `/api/v1/admin/users/:id/role` | Update user role | Admin |
| DELETE | `/api/v1/admin/users/:id` | Delete user + tasks | Admin |

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth with configurable expiry
- **Role-Based Access Control**: User vs Admin roles with middleware guards
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS**: Configured for frontend origin
- **Input Validation**: Server-side validation on all endpoints
- **HPP**: HTTP Parameter Pollution protection
- **Body Size Limit**: 10KB JSON body limit

---

## 📊 Database Schema

### User
```javascript
{
  name: String (required, max 50),
  email: String (required, unique, validated),
  password: String (required, min 6, hashed, hidden),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  title: String (required, max 100),
  description: String (max 500),
  status: String (enum: ['pending', 'in-progress', 'completed']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🏗️ Scalability Notes

### Current Architecture
The application follows a **modular monolith** pattern with clear separation of concerns, making it ready for horizontal scaling:

### Ready for Scale
1. **Microservices Migration**: Each module (auth, tasks, admin) is isolated into its own controller/routes, making it straightforward to extract into independent microservices with separate databases.

2. **Caching Layer (Redis)**: The task listing endpoints can be enhanced with Redis caching:
   - Cache task lists per user with TTL-based invalidation
   - Cache JWT token blacklist for secure logout
   - Session store for horizontal scaling across multiple server instances

3. **Load Balancing**: The stateless JWT authentication enables easy horizontal scaling:
   - Deploy behind Nginx/HAProxy load balancer
   - Round-robin or least-connections distribution
   - No sticky sessions required

4. **Database Optimization**:
   - MongoDB indexes on `createdBy`, `status`, and `createdAt` fields
   - Connection pooling via Mongoose
   - Read replicas for query-heavy workloads
   - Sharding by user ID for massive scale

5. **API Gateway**: Add an API Gateway (Kong, Express Gateway) for:
   - Centralized rate limiting
   - Request routing to microservices
   - API key management
   - Request/response transformation

6. **Message Queue**: For async operations (email notifications, analytics):
   - RabbitMQ or AWS SQS for task queues
   - Event-driven architecture for loose coupling

7. **Docker Deployment**:
   ```yaml
   # docker-compose.yml (example)
   services:
     api:
       build: ./backend
       ports: ["5000:5000"]
       depends_on: [mongo, redis]
     frontend:
       build: ./frontend
       ports: ["3000:3000"]
     mongo:
       image: mongo:7
       volumes: [mongo-data:/data/db]
     redis:
       image: redis:alpine
   ```

8. **CI/CD Pipeline**: GitHub Actions for automated testing, building, and deployment to cloud platforms (AWS ECS, GCP Cloud Run, or DigitalOcean App Platform).

---

## 📖 API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:5000/api-docs
```

This provides:
- All endpoint documentation with request/response schemas
- Try-it-out functionality for testing APIs directly
- Authentication via Bearer token in the Swagger UI

---

## 🎨 Frontend Features

- **Authentication Pages**: Register & Login with real-time validation
- **Protected Dashboard**: JWT-gated with automatic redirect
- **Task Management**: Full CRUD with status/priority filters
- **Admin Panel**: User management with role editing (admin only)
- **Toast Notifications**: Success/error messages from API responses
- **Dark Theme**: Modern glassmorphism UI with gradient accents
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Staggered Animations**: Smooth fade-in-up transitions

---

## 📝 License

ISC
