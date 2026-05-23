#  Play4G – Backend API

A REST API server for the Play4G sports facility booking platform.

---

##  Purpose

This backend handles:
- Facility management (CRUD)
- Booking system
- User authentication validation
- Secure API access using JWT

---

##  Live URL

https://play4g-server.vercel.app

---

##  API Features

### 🏟 Facilities
- GET /facilities
- GET /facilityDetails/:id
- POST /facilities (protected)
- PATCH /facilityDetails/:id (protected)
- DELETE /facilityDetails/:id

###  Bookings
- GET /bookings (protected)
- POST /bookings
- DELETE /bookings/:id

---

##  Authentication

- JWT authentication using `jose-cjs`
- Token verification middleware
- JWKS-based public key verification
- Protected routes using Bearer token

---

##  NPM Packages Used

- express
- cors
- mongodb
- jose-cjs
- dotenv

---

##  Database

- MongoDB Atlas
- Collections:
  - Facilities
  - Bookings

---

##  Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT (JOSE)

---

## Deployment

- Hosted on Vercel Serverless Functions

---

##  Author

Syed Takmil