# Backend Code Explanation

## 📋 What Was Created (Backend Only)

**NO FRONTEND FILES WERE MODIFIED** - Your frontend remains exactly as it was. Only backend files were created.

## 🗂️ Backend Structure Explained

### 1. **Server Entry Point** (`src/server.ts`)
- Main Express application
- Sets up middleware (CORS, compression, security)
- Connects to MongoDB
- Registers all API routes
- Handles errors globally

**Key Points:**
- Runs on port 5000 (configurable)
- Accepts requests from frontend (CORS configured)
- All routes prefixed with `/api`

### 2. **Database Connection** (`src/config/database.ts`)
- Connects to MongoDB
- Handles connection errors
- Graceful shutdown on app termination

**What it does:**
- Connects using `MONGODB_URI` from `.env`
- Creates database `health-hub` if it doesn't exist
- Logs connection status

### 3. **Models** (`src/models/`)
These define your database structure (like tables in SQL):

#### **User.model.ts**
- Stores system users (doctors, nurses, etc.)
- Fields: name, email, password (hashed), role, department
- Password automatically hashed before saving

#### **Patient.model.ts**
- Stores patient information
- Fields: forceNo, mrNo, firstName, lastName, gender, DOB, etc.
- Includes family members array
- Indexed on forceNo and mrNo for fast searches

#### **Appointment.model.ts**
- Stores appointments
- Links to Patient and Doctor
- Has status: scheduled, waiting, in-progress, completed, cancelled
- Generates unique token numbers

#### **Prescription.model.ts**
- Doctor prescriptions
- Contains medicines array with dosage, frequency, duration
- Links to patient, doctor, and appointment

#### **LabTest.model.ts** & **RadiologyTest.model.ts**
- Test requests and results
- Status tracking: requested → sample-collected → completed
- Can search by MR No or Prescription No

#### **Inventory.model.ts**
- Stores medicines, equipment, consumables
- Tracks stock levels
- Alerts when stock is low

#### **Billing.model.ts**
- Invoices and payments
- Calculates totals automatically
- Tracks payment status

#### **NurseRecord.model.ts**
- Vital signs and care notes
- Medication administration records

### 4. **Controllers** (`src/controllers/`)
These contain the business logic (what happens when API is called):

**Example Flow:**
```
User calls: POST /api/patients
↓
patient.controller.ts → registerPatient()
↓
Creates new Patient in database
↓
Returns success response
```

**Key Controllers:**
- `auth.controller.ts` - Login, register, get current user
- `patient.controller.ts` - CRUD operations for patients
- `appointment.controller.ts` - Create, update, get appointments
- `doctor.controller.ts` - Prescriptions, test requests, patient history
- `laboratory.controller.ts` - Process lab tests, enter results
- `radiology.controller.ts` - Upload reports, update status
- `pharmacy.controller.ts` - Dispense prescriptions, check inventory
- `inventory.controller.ts` - Manage stock, get alerts
- `billing.controller.ts` - Create invoices, process payments
- `nurse.controller.ts` - Record vitals, add medication records
- `admin.controller.ts` - User management, reports
- `receptionist.controller.ts` - Dashboard stats, bills

### 5. **Routes** (`src/routes/`)
These define the API endpoints:

**Example:**
```typescript
// patient.routes.ts
router.post('/', authenticate, authorize('admin', 'receptionist'), registerPatient);
```

**What this means:**
- `POST /api/patients` - Create patient
- Requires authentication (logged in)
- Only admin or receptionist can access

**Route Structure:**
- `/api/auth/*` - Authentication (public)
- `/api/patients/*` - Patient operations
- `/api/appointments/*` - Appointments
- `/api/doctor/*` - Doctor operations
- `/api/laboratory/*` - Lab operations
- `/api/radiology/*` - Radiology operations
- `/api/pharmacy/*` - Pharmacy operations
- `/api/inventory/*` - Inventory management
- `/api/billing/*` - Billing operations
- `/api/nurse/*` - Nurse operations
- `/api/receptionist/*` - Receptionist operations
- `/api/admin/*` - Admin operations

### 6. **Middleware** (`src/middleware/`)

#### **auth.middleware.ts**
- `authenticate` - Verifies JWT token
- `authorize` - Checks if user has required role

**How it works:**
```
Request comes in with token
↓
authenticate middleware checks token
↓
If valid, adds user to request object
↓
authorize middleware checks user role
↓
If authorized, request continues
```

#### **errorHandler.ts**
- Catches all errors
- Formats error responses consistently
- Handles MongoDB errors gracefully

### 7. **Utils** (`src/utils/`)
- `generateToken.ts` - Creates JWT tokens for authentication

## 🔄 How Data Flows

### Example: Registering a Patient

1. **Frontend** sends request:
   ```
   POST /api/patients
   Body: { forceNo: "F-123", firstName: "Ahmed", ... }
   Headers: { Authorization: "Bearer <token>" }
   ```

2. **Route** (`patient.routes.ts`):
   - Checks authentication
   - Checks authorization (receptionist/admin only)
   - Calls controller

3. **Controller** (`patient.controller.ts`):
   - Validates data
   - Checks if Force No already exists
   - Creates patient in database
   - Returns response

4. **Response** sent back:
   ```json
   {
     "status": "success",
     "data": { "patient": {...} }
   }
   ```

## 🔐 Authentication Flow

1. User logs in → `POST /api/auth/login`
2. Backend verifies credentials
3. Backend generates JWT token
4. Token sent to frontend
5. Frontend stores token
6. Frontend includes token in all requests: `Authorization: Bearer <token>`
7. Backend verifies token on each request

## 🗄️ Database (MongoDB)

**You DON'T need to provide JSON files!**

MongoDB works differently:
- **No SQL tables** - Uses collections (like folders)
- **No schema files needed** - Models define structure
- **Data stored as documents** (like JSON objects)
- **Database created automatically** when first data is saved

**What happens:**
1. You start MongoDB
2. Backend connects to MongoDB
3. When you create first patient, MongoDB creates:
   - Database: `health-hub`
   - Collection: `patients`
   - Document: Your patient data

**If you want initial/seed data:**
- I can create a seed script
- It will populate database with sample data
- Useful for testing

## 📝 Key Concepts

### 1. **Models = Database Structure**
Think of models as blueprints for your data.

### 2. **Controllers = Business Logic**
What happens when someone calls your API.

### 3. **Routes = API Endpoints**
The URLs your frontend will call.

### 4. **Middleware = Security & Validation**
Runs before your controller to check permissions.

## 🎯 What Your Frontend Needs to Do

Your frontend currently uses mock data. To connect:

1. **Create API helper** (see `FRONTEND_CONNECTION_GUIDE.md`)
2. **Update AuthContext** to call `/api/auth/login` instead of mock
3. **Update forms** to call backend APIs instead of setTimeout
4. **Handle responses** - Backend returns `{ status, data }` format

## ❓ Do You Need Database Files?

**Short Answer: NO**

**Why:**
- MongoDB creates database automatically
- Models define structure
- Data is stored as you use the app

**But if you want:**
- **Seed data** (sample patients, users, etc.) - I can create a script
- **Initial data** (pre-populated database) - I can create a script
- **Backup/restore** - MongoDB has built-in tools

**If you have existing data in JSON format:**
- I can create a migration script to import it
- Just share the JSON structure

## 🔍 Understanding the Code

### Simple Example: Getting All Patients

**Route:**
```typescript
router.get('/', authenticate, getAllPatients);
```
- URL: `GET /api/patients`
- Requires: Authentication
- Calls: `getAllPatients` function

**Controller:**
```typescript
export const getAllPatients = async (req, res) => {
  const patients = await Patient.find({});
  res.json({ status: 'success', data: { patients } });
};
```
- Queries database
- Returns all patients

**Model:**
```typescript
const Patient = mongoose.model('Patient', PatientSchema);
```
- Defines what a patient looks like
- Provides methods to query database

## 🚀 Next Steps

1. **Install backend dependencies**: `cd backend && npm install`
2. **Set up `.env` file**: Copy from `env.example`
3. **Start MongoDB**: Make sure it's running
4. **Start backend**: `npm run dev`
5. **Connect frontend**: Follow `FRONTEND_CONNECTION_GUIDE.md`

## 💡 Tips

- **All API responses** follow same format: `{ status: 'success'|'error', data: {...} }`
- **All errors** are caught and formatted consistently
- **Authentication** is required for most endpoints
- **Authorization** checks user roles
- **Database** is created automatically when you start using it

---

**Need seed data or have existing JSON? Let me know!** I can create import scripts.

