# LifeLine Backend API

Backend server for the LifeLine blood donation management system. Built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth for patients, donors, and blood banks
- **Blood Request Management**: Patients can request blood with doctor-signed document verification
- **Donation Tracking**: Donors can register for blood donation camps and track donation history
- **Blood Bank Operations**: Inventory management, request/donation approval workflows
- **Camp Management**: Blood banks can organize and manage donation camps
- **Real-time Stock Updates**: Automatic inventory adjustments based on donations and requests

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Session Management**: cookie-parser, express-session

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
cd LifeLine/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=3177
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Running the Server

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for auto-reloading on file changes.

### Production Mode
```bash
node app.js
```

The server will run on `http://localhost:3177` by default.

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/donor` - Register new donor
- `POST /auth/patient` - Register new patient
- `POST /auth/bank` - Register new blood bank
- `POST /auth/login/:handle` - Login (donor/patient/bank)
- `GET /auth/loggedIn` - Check authentication status
- `GET /auth/logout` - Logout user

### User Operations (`/user`)
- `GET /user` - Get logged-in user info
- `POST /user/donate` - Submit blood donation request
- `POST /user/request` - Submit blood request (requires doctor document)
- `GET /user/donations` - Get user's donation history
- `GET /user/requests` - Get user's blood request history
- `PUT /user` - Update user profile

### Blood Bank Operations (`/bank`)
- `GET /bank/getStock` - Get current blood inventory
- `PUT /bank/updateStock` - Add blood units to inventory
- `PUT /bank/deleteStock` - Remove blood units from inventory
- `GET /bank/donations` - Get all donations for the bank
- `GET /bank/requests` - Get all blood requests for the bank
- `PUT /bank/donations` - Update donation status
- `PUT /bank/requests` - Update request status
- `GET /bank/allBanks/:state/:district` - Search blood banks by location
- `PUT /bank` - Update blood bank profile

### Camp Management (`/camps`)
- `POST /camps` - Create new blood donation camp
- `GET /camps/allCamps/:state/:district/:date` - Public search for camps
- `GET /camps/:state?/:district?` - Get camps (with auth)
- `PUT /camps/:id/:userId?` - Register for camp or update donor status

## Data Models

### User (Donor/Patient)
- Personal info (name, age, gender, blood group)
- Contact details (email, phone, address)
- Location (state, district)

### Blood Bank
- Institution details (name, hospital, category)
- Contact information
- Geolocation (latitude, longitude)
- Blood inventory (stock by blood group)
- Donation/request queues

### Blood Request
- Patient information
- Blood group and units required
- Reason for request
- **Doctor-signed document** (PDF/image, base64)
- Status tracking (Pending → Approved → Completed)

### Donation
- Donor information
- Units donated
- Health screening info
- Status tracking (Pending → Approved → Donated)

### Camp
- Camp details (name, date, location, timings)
- Organizing blood bank
- Registered donors list

## Authentication Flow

1. User registers via `/auth/:handle` endpoint
2. Credentials hashed with bcrypt before storage
3. Login returns JWT token stored in httpOnly cookie
4. Protected routes use `auth` middleware to verify token
5. Token contains user ID and role (donor/patient/bank)

## Document Upload Feature

Blood requests from patients require a doctor-signed document:
- Accepted formats: PDF, JPG, PNG (max 2MB)
- Stored as base64-encoded data URL in MongoDB
- Blood banks can view/download documents for verification

## Error Handling

- All routes wrapped in try-catch blocks
- Consistent error responses with appropriate HTTP status codes
- MongoDB errors logged to console
- Client receives user-friendly error messages

## CORS Configuration

Configured to allow requests from:
- `http://localhost:3000` (development frontend)

Update `allowedOrigins` in `app.js` for production deployment.

## Project Structure

```
backend/
├── app.js                 # Express app setup & server start
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   └── models.js         # Mongoose schemas (User, Bank, Request, Donation, Camp)
├── routers/
│   ├── authRouter.js     # Authentication endpoints
│   ├── userRouter.js     # User operations
│   ├── bankRouter.js     # Blood bank operations
│   └── campRouter.js     # Camp management
├── package.json
├── .env                  # Environment variables (not in repo)
└── README.md
```

## Development Notes

- MongoDB warnings about `useNewUrlParser` and `useUnifiedTopology` can be ignored (deprecated in driver v4+)
- Stock updates are atomic to prevent race conditions
- Camp date queries use day range (`$gte`/`$lte`) for accurate matching
- Populate operations exclude sensitive fields (passwords, tokens)

## Security Considerations

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens stored in httpOnly cookies (prevents XSS)
- Environment variables for sensitive config
- Input validation on all user-submitted data
- File upload size limits enforced (2MB max)

## Contributing

1. Create feature branch from `main`
2. Make changes and test locally
3. Ensure no lint errors
4. Submit pull request with clear description

## License

ISC
