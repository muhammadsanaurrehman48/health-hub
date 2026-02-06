# Health Hub Backend

Smart Hospital Management System Backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ Complete authentication and authorization system
- ✅ Role-based access control (9 different roles)
- ✅ Patient management with Force No and MR No tracking
- ✅ Appointment scheduling and management
- ✅ Doctor consultations and prescriptions
- ✅ Laboratory test management
- ✅ Radiology test management
- ✅ Pharmacy and inventory management
- ✅ Billing and payment processing
- ✅ Nurse records and vital signs tracking
- ✅ Comprehensive reporting system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, CORS

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/             # Business logic
│   │   ├── admin.controller.ts
│   │   ├── appointment.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── billing.controller.ts
│   │   ├── doctor.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── laboratory.controller.ts
│   │   ├── nurse.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── pharmacy.controller.ts
│   │   ├── radiology.controller.ts
│   │   └── receptionist.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # Authentication & authorization
│   │   └── errorHandler.ts      # Error handling
│   ├── models/                  # MongoDB models
│   │   ├── Appointment.model.ts
│   │   ├── Billing.model.ts
│   │   ├── Inventory.model.ts
│   │   ├── LabTest.model.ts
│   │   ├── NurseRecord.model.ts
│   │   ├── Patient.model.ts
│   │   ├── Prescription.model.ts
│   │   ├── RadiologyTest.model.ts
│   │   └── User.model.ts
│   ├── routes/                  # API routes
│   │   ├── admin.routes.ts
│   │   ├── appointment.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── billing.routes.ts
│   │   ├── doctor.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── laboratory.routes.ts
│   │   ├── nurse.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── pharmacy.routes.ts
│   │   ├── radiology.routes.ts
│   │   └── receptionist.routes.ts
│   ├── utils/
│   │   └── generateToken.ts      # JWT token generation
│   └── server.ts                # Express app entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Set Up Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/health-hub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

3. **Start MongoDB**
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

4. **Run the Server**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

### Base URL
```
http://localhost:5000/api
```

### Quick Start Examples

**Register a User:**
```bash
POST /api/auth/register
```

**Login:**
```bash
POST /api/auth/login
```

**Get All Patients:**
```bash
GET /api/patients
Authorization: Bearer <token>
```

## User Roles

The system supports the following roles:

1. **admin** - Full system access
2. **receptionist** - Patient registration, appointments, billing
3. **doctor** - Consultations, prescriptions, test requests
4. **radiologist** - Radiology test management
5. **laboratory** - Lab test management
6. **pharmacy** - Prescription dispensing, inventory
7. **inventory** - Inventory management
8. **billing** - Billing and payments
9. **nurse** - Vital signs, care notes, medication records

## Database Models

- **User** - System users with roles and permissions
- **Patient** - Patient information with Force No and MR No
- **Appointment** - Appointment scheduling
- **Prescription** - Doctor prescriptions
- **LabTest** - Laboratory test requests and results
- **RadiologyTest** - Radiology test requests and reports
- **Inventory** - Inventory items (medicines, equipment, consumables)
- **Billing** - Invoices and payments
- **NurseRecord** - Vital signs and care records

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based authorization
- CORS protection
- Helmet.js for security headers
- Input validation
- Error handling middleware

## Performance Optimizations

- Database indexing on frequently queried fields
- Compression middleware for response size reduction
- Efficient query patterns
- Minimal dependencies for faster startup

## Development

### Code Structure
- Controllers handle business logic
- Models define data structure
- Routes define API endpoints
- Middleware handles authentication and errors

### Adding New Features

1. Create/update model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Add route to `src/server.ts`

## Testing

Health check endpoint:
```bash
GET /api/health
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment-specific MongoDB URI
5. Enable HTTPS
6. Set up proper logging
7. Configure rate limiting
8. Set up backup strategy for MongoDB

## License

ISC

## Support

For issues or questions, please refer to the API documentation or contact the development team.

