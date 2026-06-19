# MediChain Backend 🏥

A secure, role-based healthcare management system that connects patients and doctors through a modern REST API — built from scratch without relying on third-party auth services.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (Access + Refresh Token Rotation)
- **Image Upload:** ImageKit
- **Validation:** express-validator
- **Other:** cookie-parser, cors, morgan, multer

---

## Features

- ✅ JWT authentication with access/refresh token rotation
- ✅ Session management with token hashing
- ✅ Role-based access control (Patient, Doctor, Admin)
- ✅ Doctor profile management with image upload
- ✅ Appointment booking system
- ✅ Admin dashboard (verify doctors, manage users)
- ✅ Input validation on all routes

---

## Folder Structure

```
medichain-backend/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── doctor.controller.js
│   │   ├── appointment.controller.js
│   │   └── admin.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── session.model.js
│   │   ├── doctor.model.js
│   │   └── appointment.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── appointment.routes.js
│   │   └── admin.routes.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── doctor.validator.js
│   │   └── appointment.validator.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/its-adii/medichain-backend.git
cd medichain-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 4. Run the server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Environment Variables

| Variable                | Description                |
| ----------------------- | -------------------------- |
| `MONGO_URI`             | MongoDB connection string  |
| `JWT_SECRET`            | Secret key for JWT signing |
| `IMAGEKIT_PUBLIC_KEY`   | ImageKit public key        |
| `IMAGEKIT_PRIVATE_KEY`  | ImageKit private key       |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint      |

---

## API Documentation

### Auth Routes

| Method | Route                     | Access  | Description          |
| ------ | ------------------------- | ------- | -------------------- |
| POST   | `/api/auth/register`      | Public  | Register a new user  |
| POST   | `/api/auth/login`         | Public  | Login user           |
| POST   | `/api/auth/logout`        | Public  | Logout user          |
| POST   | `/api/auth/refresh-token` | Public  | Refresh access token |
| GET    | `/api/auth/me`            | Private | Get current user     |

### Doctor Routes

| Method | Route                  | Access       | Description           |
| ------ | ---------------------- | ------------ | --------------------- |
| POST   | `/api/doctors/profile` | Doctor/Admin | Create doctor profile |
| GET    | `/api/doctors`         | Public       | Get all doctors       |
| GET    | `/api/doctors/:id`     | Public       | Get doctor by ID      |
| PATCH  | `/api/doctors/profile` | Doctor/Admin | Update doctor profile |

### Appointment Routes

| Method | Route                          | Access       | Description               |
| ------ | ------------------------------ | ------------ | ------------------------- |
| POST   | `/api/appointments`            | Patient      | Book appointment          |
| GET    | `/api/appointments/my`         | Patient      | Get my appointments       |
| GET    | `/api/appointments/doctor`     | Doctor       | Get doctor appointments   |
| GET    | `/api/appointments`            | Admin        | Get all appointments      |
| PATCH  | `/api/appointments/:id/status` | Doctor/Admin | Update appointment status |

### Admin Routes

| Method | Route                           | Access | Description     |
| ------ | ------------------------------- | ------ | --------------- |
| GET    | `/api/admin/users`              | Admin  | Get all users   |
| DELETE | `/api/admin/users/:id`          | Admin  | Delete a user   |
| GET    | `/api/admin/doctors`            | Admin  | Get all doctors |
| PATCH  | `/api/admin/doctors/:id/verify` | Admin  | Verify a doctor |

---

## Author

**Aditya Kumar Sharma** — [@its-adii](https://github.com/its-adii)
