# StudioSpace Backend

A RESTful API for **StudioSpace**, a studio discovery and booking platform. The backend handles studio management, user authentication, bookings, reviews, and database operations.

## Overview

StudioSpace Backend is built with Node.js and Express.js, using MongoDB as its database. It provides secure API endpoints for managing studios, handling reservations, and supporting host and customer activities.

## Features

- **Studio Management** – Create, retrieve, update, and delete studio listings.
- **Booking Management** – Create and manage studio reservations.
- **Booking Status Management** – Update booking statuses and handle cancellations.
- **Authentication & Authorization** – Verify Better Auth JWT access tokens.
- **JWT Verification** – Secure token verification using JOSE and remote JWKS.
- **Review System** – Support studio reviews and ratings.
- **MongoDB Integration** – Store and manage application data using MongoDB Native Driver.
- **Database Indexing** – Create indexes for studios and bookings.
- **CORS Configuration** – Configure allowed frontend origins.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | NoSQL database |
| MongoDB Native Driver | Database operations |
| Better Auth | Authentication |
| JOSE | JWT verification |
| Nodemon | Development server |

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/nihal2855/StudioSpaceBackEnd.git
```

Navigate to the project directory:

```bash
cd StudioSpaceBackEnd
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend root directory.

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:3000

BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
```

**Important:** Never commit your `.env` file or expose database credentials, authentication secrets, or private keys in a public repository.

### Run the Development Server

```bash
npm run dev
```

### Run the Production Server

```bash
npm start
```

The backend will run at:

```text
http://localhost:5000
```

## Authentication

StudioSpace uses Better Auth for user authentication.

The backend verifies JWT access tokens using:

- JOSE library
- Better Auth JWKS endpoint
- EdDSA signature verification
- Issuer and audience validation

Protected API requests must include a Bearer token:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The backend retrieves the public signing keys from:

```text
{BETTER_AUTH_URL}/api/auth/jwks
```

## API Overview

The backend provides API functionality for the following modules:

| Module | Description |
|---|---|
| Studios | Studio listing and management |
| Bookings | Studio reservation management |
| Host Bookings | Host-side booking management |
| Reviews | Studio reviews and ratings |
| Authentication | JWT-based API authorization |

For exact endpoint paths, request parameters, and response formats, refer to the corresponding route and controller files in the source code.

## Database

StudioSpace uses MongoDB to store application data.

Database operations are handled through the MongoDB Native Driver.

The backend initializes database indexes for:

- Studio collections
- Booking collections

## Deployment

The backend is deployed using **Render**.

Production API:

```text
https://studiospacebackend.onrender.com
```

For production deployment:

1. Connect the backend GitHub repository to Render.
2. Configure the build command:

   ```bash
   npm install
   ```

3. Configure the start command:

   ```bash
   npm start
   ```

4. Add all required environment variables in Render.
5. Deploy the service.

## Frontend Integration

The StudioSpace frontend communicates with this backend through REST API requests.

Local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Production:

```env
NEXT_PUBLIC_API_URL=https://studiospacebackend.onrender.com
```

Make sure the backend CORS configuration allows the frontend origin.

## Author

**StudioSpace Project**

GitHub: [nihal2855](https://github.com/nihal2855)

## License

This project is developed for educational and practical learning purposes.
