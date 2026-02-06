# Frontend-Backend Connection Guide

This guide explains how to connect your React frontend with the Node.js backend.

## Setup Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/health-hub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### 5. Update Frontend API Configuration

Create or update your API configuration file in the frontend:

**File: `src/lib/api.ts`**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('hms_token') || '';
};

// API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response;
};

// API methods
export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};
```

### 6. Update AuthContext

Update your `src/contexts/AuthContext.tsx` to use the backend API:

```typescript
import { api } from '@/lib/api';

// In your login function:
const login = useCallback(async (email: string, password: string, role: UserRole) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const data = await response.json();
    
    if (data.status === 'success') {
      const { user, token } = data.data;
      localStorage.setItem('hms_token', token);
      localStorage.setItem('hms_user', JSON.stringify(user));
      setUser(user);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}, []);

// In your signup function:
const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role,
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      const { user, token } = data.data;
      localStorage.setItem('hms_token', token);
      localStorage.setItem('hms_user', JSON.stringify(user));
      setUser(user);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
}, []);
```

### 7. Update Patient Registration

Update `src/components/patients/PatientRegistrationForm.tsx`:

```typescript
import { api } from '@/lib/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const patientData = {
      forceNo,
      mrNo,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      bloodGroup,
      cnic,
      phone,
      email,
      address,
      city,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation,
      },
      familyMembers,
      allergies,
      existingConditions,
    };

    const response = await api.post('/patients', patientData);
    const data = await response.json();

    if (data.status === 'success') {
      toast.success('Patient registered successfully!', {
        description: `MR No: ${mrNo} - ${firstName} ${lastName}`,
      });
      navigate('/receptionist/patients/search');
    }
  } catch (error: any) {
    toast.error('Registration failed', {
      description: error.message,
    });
  } finally {
    setIsLoading(false);
  }
};
```

## API Response Format

All API responses follow this format:

**Success:**
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error message"
}
```

## Common API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Register patient
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/search/force/:forceNo` - Search by Force No

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id/status` - Update status

### Doctor
- `GET /api/doctor/appointments` - Get doctor's appointments
- `GET /api/doctor/patient/:id/history` - Get patient history
- `POST /api/doctor/prescription` - Create prescription
- `POST /api/doctor/lab-test` - Request lab test
- `POST /api/doctor/radiology-test` - Request radiology test

See `API_DOCUMENTATION.md` for complete endpoint list.

## Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const response = await api.get('/patients');
  const data = await response.json();
  // Handle success
} catch (error: any) {
  // Handle error
  toast.error(error.message);
}
```

## CORS Configuration

The backend is configured to accept requests from `http://localhost:5173` (Vite default). If your frontend runs on a different port, update `FRONTEND_URL` in backend `.env`.

## Token Management

- Tokens are stored in `localStorage` as `hms_token`
- Tokens expire in 7 days (configurable)
- Include token in Authorization header: `Bearer <token>`
- Handle 401 errors by redirecting to login

## Testing the Connection

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Test health endpoint: `GET http://localhost:5000/api/health`
4. Try logging in through the frontend

## Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` in backend `.env`
- Ensure backend CORS middleware is configured correctly

### 401 Unauthorized
- Check if token is being sent in headers
- Verify token is valid and not expired
- Check user role permissions

### 404 Not Found
- Verify API endpoint URL
- Check if route exists in backend
- Ensure backend server is running

### Connection Refused
- Verify backend is running on correct port
- Check firewall settings
- Verify MongoDB is running

## Next Steps

1. Replace all mock data in frontend with API calls
2. Add loading states for async operations
3. Implement proper error handling
4. Add request/response interceptors if needed
5. Set up environment variables for different environments

