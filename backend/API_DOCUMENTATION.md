# Health Hub API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Access**: Public
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "doctor",
  "department": "Cardiology",
  "phone": "03001234567"
}
```

### Login
- **POST** `/api/auth/login`
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: Returns user object and JWT token

### Get Current User
- **GET** `/api/auth/me`
- **Access**: Private
- **Response**: Returns current logged-in user details

---

## Patient Endpoints

### Register Patient
- **POST** `/api/patients`
- **Access**: Private (Receptionist, Admin)
- **Body**:
```json
{
  "forceNo": "F-12345",
  "mrNo": "MR-001234",
  "firstName": "Ahmed",
  "lastName": "Khan",
  "gender": "male",
  "dateOfBirth": "1980-01-15",
  "bloodGroup": "O+",
  "cnic": "12345-1234567-1",
  "phone": "03001234567",
  "email": "ahmed@example.com",
  "address": "123 Main Street",
  "city": "Karachi",
  "emergencyContact": {
    "name": "Fatima Khan",
    "phone": "03009876543",
    "relation": "spouse"
  },
  "familyMembers": [
    {
      "name": "Ali Khan",
      "relation": "son",
      "age": 10,
      "gender": "male"
    }
  ],
  "allergies": "Penicillin",
  "existingConditions": "Hypertension"
}
```

### Get All Patients
- **GET** `/api/patients`
- **Access**: Private
- **Query Parameters**:
  - `search`: Search by name, phone, or MR No
  - `forceNo`: Filter by Force No
  - `mrNo`: Filter by MR No

### Search by Force No
- **GET** `/api/patients/search/force/:forceNo`
- **Access**: Private
- **Returns**: Patients and their family members

### Get Patient by ID
- **GET** `/api/patients/:id`
- **Access**: Private

### Update Patient
- **PUT** `/api/patients/:id`
- **Access**: Private (Receptionist, Admin)

### Delete Patient
- **DELETE** `/api/patients/:id`
- **Access**: Private (Admin)

---

## Appointment Endpoints

### Create Appointment
- **POST** `/api/appointments`
- **Access**: Private (Receptionist, Admin)
- **Body**:
```json
{
  "patient": "patient_id",
  "doctor": "doctor_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00 AM",
  "complaint": "Chest pain",
  "type": "OPD",
  "notes": "Follow-up visit"
}
```

### Get All Appointments
- **GET** `/api/appointments`
- **Access**: Private
- **Query Parameters**:
  - `date`: Filter by date (YYYY-MM-DD)
  - `status`: Filter by status (scheduled, waiting, in-progress, completed, cancelled)
  - `doctor`: Filter by doctor ID
  - `patient`: Filter by patient ID

### Get Doctor's Appointments
- **GET** `/api/appointments/doctor/:doctorId`
- **Access**: Private
- **Query Parameters**:
  - `date`: Filter by date (defaults to today)

### Get Appointment by ID
- **GET** `/api/appointments/:id`
- **Access**: Private

### Update Appointment Status
- **PATCH** `/api/appointments/:id/status`
- **Access**: Private (Doctor, Receptionist, Admin)
- **Body**:
```json
{
  "status": "in-progress"
}
```

---

## Doctor Endpoints

### Get My Appointments
- **GET** `/api/doctor/appointments`
- **Access**: Private (Doctor)
- **Query Parameters**:
  - `date`: Filter by date (defaults to today)
  - `status`: Filter by status

### Get Patient History
- **GET** `/api/doctor/patient/:patientId/history`
- **Access**: Private (Doctor)
- **Returns**: Complete medical history including appointments, prescriptions, lab tests, and radiology tests

### Create Prescription
- **POST** `/api/doctor/prescription`
- **Access**: Private (Doctor)
- **Body**:
```json
{
  "patient": "patient_id",
  "appointment": "appointment_id",
  "medicines": [
    {
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "After meals"
    }
  ],
  "diagnosis": "Fever",
  "notes": "Rest and hydration"
}
```

### Request Lab Test
- **POST** `/api/doctor/lab-test`
- **Access**: Private (Doctor)
- **Body**:
```json
{
  "patient": "patient_id",
  "prescription": "prescription_id",
  "appointment": "appointment_id",
  "testName": "Complete Blood Count",
  "testType": "CBC"
}
```

### Request Radiology Test
- **POST** `/api/doctor/radiology-test`
- **Access**: Private (Doctor)
- **Body**:
```json
{
  "patient": "patient_id",
  "prescription": "prescription_id",
  "appointment": "appointment_id",
  "testName": "Chest X-Ray",
  "testType": "X-Ray"
}
```

---

## Laboratory Endpoints

### Get Lab Requests
- **GET** `/api/laboratory/requests`
- **Access**: Private (Laboratory)
- **Query Parameters**:
  - `status`: Filter by status (requested, sample-collected, in-progress, completed, cancelled)
  - `mrNo`: Search by patient MR No
  - `prescriptionNo`: Search by prescription number

### Get Lab Test by ID
- **GET** `/api/laboratory/:id`
- **Access**: Private (Laboratory, Doctor)

### Record Sample Collection
- **PATCH** `/api/laboratory/:id/sample`
- **Access**: Private (Laboratory)
- **Body**: Automatically sets sample collection date and user

### Enter Test Results
- **PATCH** `/api/laboratory/:id/results`
- **Access**: Private (Laboratory)
- **Body**:
```json
{
  "results": {
    "hemoglobin": "14.5 g/dL",
    "wbc": "7000",
    "rbc": "4.5 million"
  },
  "notes": "All values within normal range"
}
```

### Update Lab Test Status
- **PATCH** `/api/laboratory/:id/status`
- **Access**: Private (Laboratory)
- **Body**:
```json
{
  "status": "completed"
}
```

---

## Radiology Endpoints

### Get Radiology Requests
- **GET** `/api/radiology/requests`
- **Access**: Private (Radiologist)
- **Query Parameters**:
  - `status`: Filter by status
  - `mrNo`: Search by patient MR No
  - `prescriptionNo`: Search by prescription number

### Get Radiology Test by ID
- **GET** `/api/radiology/:id`
- **Access**: Private (Radiologist, Doctor)

### Upload Report
- **PATCH** `/api/radiology/:id/upload`
- **Access**: Private (Radiologist)
- **Body**:
```json
{
  "reportUrl": "https://example.com/report.pdf",
  "reportFile": "report.pdf",
  "findings": "No abnormalities detected",
  "notes": "Normal chest X-ray"
}
```

### Update Radiology Test Status
- **PATCH** `/api/radiology/:id/status`
- **Access**: Private (Radiologist)

---

## Pharmacy Endpoints

### Get Prescriptions
- **GET** `/api/pharmacy/prescriptions`
- **Access**: Private (Pharmacy)
- **Query Parameters**:
  - `status`: Filter by status (pending, dispensed, cancelled)
  - `mrNo`: Search by patient MR No
  - `prescriptionNo`: Search by prescription number

### Get Prescription by ID
- **GET** `/api/pharmacy/prescription/:id`
- **Access**: Private (Pharmacy)

### Dispense Prescription
- **PATCH** `/api/pharmacy/prescription/:id/dispense`
- **Access**: Private (Pharmacy)
- **Body**: Updates prescription status to 'dispensed'

### Get Pharmacy Inventory
- **GET** `/api/pharmacy/inventory`
- **Access**: Private (Pharmacy)
- **Query Parameters**:
  - `search`: Search by medicine name or code
  - `lowStock`: Filter low stock items (true/false)

---

## Inventory Endpoints

### Get All Inventory
- **GET** `/api/inventory`
- **Access**: Private (Inventory, Admin)
- **Query Parameters**:
  - `category`: Filter by category (medicine, equipment, consumable)
  - `search`: Search by name, code, or description
  - `lowStock`: Filter low stock items (true/false)

### Create Inventory Item
- **POST** `/api/inventory`
- **Access**: Private (Inventory, Admin)
- **Body**:
```json
{
  "itemCode": "MED-001",
  "itemName": "Paracetamol 500mg",
  "category": "medicine",
  "description": "Pain reliever",
  "unit": "Tablet",
  "stockQuantity": 1000,
  "minStockLevel": 100,
  "maxStockLevel": 5000,
  "supplier": "ABC Pharmaceuticals",
  "batchNumber": "BATCH-2024-001",
  "expiryDate": "2025-12-31",
  "unitPrice": 5.00,
  "department": "Pharmacy"
}
```

### Update Inventory Item
- **PUT** `/api/inventory/:id`
- **Access**: Private (Inventory, Admin)

### Delete Inventory Item
- **DELETE** `/api/inventory/:id`
- **Access**: Private (Admin)

### Get Stock Alerts
- **GET** `/api/inventory/alerts`
- **Access**: Private (Inventory, Admin)
- **Returns**: Items with stock below minimum level

### Get Inventory by ID
- **GET** `/api/inventory/:id`
- **Access**: Private (Inventory, Admin)

---

## Billing Endpoints

### Create Invoice
- **POST** `/api/billing`
- **Access**: Private (Billing, Receptionist, Admin)
- **Body**:
```json
{
  "patient": "patient_id",
  "items": [
    {
      "itemName": "Consultation Fee",
      "quantity": 1,
      "unitPrice": 1000,
      "total": 1000,
      "department": "OPD"
    }
  ],
  "discount": 0,
  "tax": 0,
  "paidAmount": 1000,
  "paymentMethod": "cash",
  "department": "OPD",
  "notes": "OPD consultation"
}
```

### Get All Invoices
- **GET** `/api/billing`
- **Access**: Private (Billing, Receptionist, Admin)
- **Query Parameters**:
  - `patient`: Filter by patient ID
  - `department`: Filter by department
  - `paymentStatus`: Filter by payment status (pending, partial, paid)
  - `startDate`: Start date for filtering
  - `endDate`: End date for filtering

### Get Invoice by ID
- **GET** `/api/billing/:id`
- **Access**: Private (Billing, Receptionist, Admin)

### Process Payment
- **PATCH** `/api/billing/:id/payment`
- **Access**: Private (Billing, Receptionist, Admin)
- **Body**:
```json
{
  "paidAmount": 500,
  "paymentMethod": "cash"
}
```

### Get Billing Reports
- **GET** `/api/billing/reports`
- **Access**: Private (Billing, Admin)
- **Query Parameters**:
  - `startDate`: Start date
  - `endDate`: End date
  - `department`: Filter by department
- **Returns**: Revenue summary and department-wise statistics

---

## Nurse Endpoints

### Record Vital Signs
- **POST** `/api/nurse/vitals`
- **Access**: Private (Nurse)
- **Body**:
```json
{
  "patient": "patient_id",
  "appointment": "appointment_id",
  "vitalSigns": {
    "temperature": 98.6,
    "bloodPressure": "120/80",
    "pulse": 72,
    "respiratoryRate": 18,
    "oxygenSaturation": 98,
    "weight": 70,
    "height": 175
  },
  "ward": "Ward A",
  "bedNumber": "A-101",
  "careNotes": "Patient is stable"
}
```

### Get Nurse Records
- **GET** `/api/nurse/records`
- **Access**: Private (Nurse, Doctor)
- **Query Parameters**:
  - `patient`: Filter by patient ID
  - `date`: Filter by date

### Get Nurse Record by ID
- **GET** `/api/nurse/records/:id`
- **Access**: Private (Nurse, Doctor)

### Add Medication Record
- **PATCH** `/api/nurse/records/:id/medication`
- **Access**: Private (Nurse)
- **Body**:
```json
{
  "medicineName": "Paracetamol",
  "dosage": "500mg",
  "time": "2024-01-15T10:00:00Z"
}
```

### Update Care Notes
- **PATCH** `/api/nurse/records/:id/notes`
- **Access**: Private (Nurse)
- **Body**:
```json
{
  "careNotes": "Patient responded well to medication"
}
```

---

## Receptionist Endpoints

### Get Dashboard Stats
- **GET** `/api/receptionist/dashboard`
- **Access**: Private (Receptionist, Admin)
- **Returns**: Today's appointments, bills, total patients, pending bills

### Get All Bills
- **GET** `/api/receptionist/bills`
- **Access**: Private (Receptionist, Admin)
- **Query Parameters**: Same as billing endpoints

---

## Admin Endpoints

### Get Dashboard Stats
- **GET** `/api/admin/dashboard`
- **Access**: Private (Admin)
- **Returns**: System-wide statistics

### Get Reports
- **GET** `/api/admin/reports`
- **Access**: Private (Admin)
- **Query Parameters**:
  - `startDate`: Start date
  - `endDate`: End date
  - `type`: Report type (billing, appointments)

### Get All Users
- **GET** `/api/admin/users`
- **Access**: Private (Admin)
- **Query Parameters**:
  - `role`: Filter by role
  - `department`: Filter by department
  - `search`: Search by name or email

### Create User
- **POST** `/api/admin/users`
- **Access**: Private (Admin)
- **Body**: Same as registration

### Update User
- **PUT** `/api/admin/users/:id`
- **Access**: Private (Admin)

### Delete User
- **DELETE** `/api/admin/users/:id`
- **Access**: Private (Admin)

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message here"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. All dates should be in ISO format (YYYY-MM-DD or ISO 8601)
2. All IDs are MongoDB ObjectIds
3. JWT tokens expire in 7 days (configurable)
4. Search queries are case-insensitive
5. All timestamps are in UTC

