# Actyme.com - Engagement Platform

A next-generation engagement platform that rewards users for completing tasks and qualifying activities with periodic prize draws.

## 🚀 Live Demo

- **Frontend**: [https://actyme-platform.vercel.app](https://actyme-platform.vercel.app)
- **API**: [https://actyme-api.herokuapp.com](https://actyme-api.herokuapp.com)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Module Documentation](#module-documentation)

## ✨ Features

### Core Platform Features
- **User Authentication**: Secure JWT-based authentication system
- **Task Management**: Complete tasks to earn points and level up
- **Rewards System**: Redeem points for vouchers from partner brands
- **Add-On Store**: Purchase premium boosts and exclusive content
- **Partner Integration**: Mock partner APIs for voucher creation and validation
- **Real-time Updates**: Live point balance and level progression

### M27 - Dashboard Integration with Partner Mocks
- ✅ **MyRewards Component**: Full integration with `/api/ota/*` endpoints
- ✅ **AddOnStore Component**: Complete voucher purchase functionality
- ✅ **State Management**: Redux-based partner data management
- ✅ **Mock-Driven Stories**: Comprehensive component testing

### M28 - Partner Integration Smoke Tests
- ✅ **API Contract Testing**: Validates all partner interface methods
- ✅ **Schema Validation**: Ensures consistent response structures
- ✅ **Error Handling**: Comprehensive error scenario testing
- ✅ **Adapter Compatibility**: Tests work with both stub and live adapters

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Express-validator and Joi
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: React 18 with functional components
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Testing**: React Testing Library
- **Build**: Create React App with Webpack

### Development & Testing
- **Testing**: Jest, Supertest, React Testing Library
- **Linting**: ESLint with React and accessibility rules
- **Code Quality**: Prettier for formatting
- **Documentation**: Storybook for component documentation

## 📁 Project Structure

```
actyme-platform/
├── backend/                 # Express.js API server
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── tests/              # Backend tests
│   │   └── smoke/          # Partner integration tests
│   └── server.js           # Entry point
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main app component
│   └── public/             # Static assets
└── package.json            # Root package configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/actyme-platform.git
cd actyme-platform
```

2. **Install dependencies**
```bash
npm run install-deps
```

3. **Set up environment variables**

Backend (`.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/actyme
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
CORS_ORIGIN=http://localhost:3000
```

Frontend (`.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start the development servers**
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:5000
- Frontend React app on http://localhost:3000

### Demo Account

Use these credentials to test the platform:
- **Email**: demo@actyme.com
- **Password**: password123

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "points": 100,
      "level": 1
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Authenticate user and get access token.

#### GET /api/auth/me
Get current user profile (requires authentication).

### Partner Integration Endpoints (OTA)

#### GET /api/ota/partners
Get list of available partner integrations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "amazon",
      "name": "Amazon",
      "logo": "https://via.placeholder.com/100x50/FF9900/FFFFFF?text=Amazon",
      "apiEndpoint": "https://api.amazon.com/vouchers",
      "supportedTypes": ["voucher", "discount"],
      "categories": ["shopping", "electronics"]
    }
  ],
  "count": 3
}
```

#### GET /api/ota/vouchers
Get available voucher templates with filtering.

**Query Parameters:**
- `category`: Filter by category (dining, shopping, travel, etc.)
- `partnerId`: Filter by specific partner
- `minPoints`: Minimum points required
- `maxPoints`: Maximum points required

#### POST /api/ota/vouchers/create
Create/redeem a voucher using points.

**Request Body:**
```json
{
  "voucherId": "amazon-10",
  "userPoints": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voucher created successfully",
  "data": {
    "id": "voucher_1234567890",
    "code": "ACT-AMAZON-10-567890",
    "template": { /* voucher template data */ },
    "partner": { /* partner data */ },
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-04-15T10:30:00Z",
    "redemptionUrl": "https://redeem.amazon.com/ACT-AMAZON-10-567890",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?data=ACT-AMAZON-10-567890"
  }
}
```

#### GET /api/ota/addons
Get available add-on products.

#### POST /api/ota/addons/purchase
Purchase an add-on product with Stripe integration.

#### GET /api/ota/vouchers/:id/status
Check voucher status with partner API.

#### POST /api/ota/test-connection
Test connection to partner API.

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

## 🧪 Testing

### Backend Tests

Run all backend tests:
```bash
cd backend && npm test
```

Run smoke tests specifically:
```bash
cd backend && npm run smoke-test
```

### Frontend Tests

Run frontend tests:
```bash
cd frontend && npm test
```

Run tests in watch mode:
```bash
cd frontend && npm test -- --watch
```

### Test Coverage

Generate coverage reports:
```bash
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage --watchAll=false
```

### Smoke Test Results

The smoke tests validate:
- ✅ Partner endpoint availability and response schemas
- ✅ Voucher creation and validation workflows
- ✅ Add-on purchase processing
- ✅ Error handling for invalid requests
- ✅ Authentication requirements
- ✅ Response time and connection stability

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
```bash
heroku create actyme-api
```

2. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set STRIPE_SECRET_KEY=your_stripe_secret
```

3. **Deploy**
```bash
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend && vercel --prod
```

3. **Set environment variables** in Vercel dashboard:
   - `REACT_APP_API_URL=https://your-api-domain.herokuapp.com/api`

## 📖 Module Documentation

### M27 - Dashboard Integration with Partner Mocks

**Objective**: Validate "My Rewards & Redemptions" and "Add-On Store" flows end-to-end using mock data.

#### Implementation Details

**UI Components:**
- `MyRewards.jsx`: Full-featured rewards dashboard with voucher redemption
- `AddOnStore.jsx`: Premium add-on marketplace with Stripe integration
- Both components integrate with `/api/ota/*` endpoints for real-time data

**State Management:**
- `partnersSlice.js`: Manages partner data, vouchers, and user vouchers
- `addonsSlice.js`: Handles add-on products and purchase history
- Redux Toolkit for predictable state updates and async actions

**Key Features:**
- Real-time voucher creation with partner API simulation
- Point balance validation and deduction
- Voucher status checking and QR code generation
- Add-on purchase flow with mock Stripe integration
- Comprehensive error handling and user feedback

#### Testing Coverage

**Storybook Stories:**
- Interactive component documentation
- Multiple data states and edge cases
- Accessibility testing with screen readers
- Visual regression testing

**Integration Tests:**
- End-to-end user flows
- API integration validation
- State management verification
- Error boundary testing

### M28 - Partner Integration Smoke Tests

**Objective**: Ensure partner interface contracts remain stable when swapping adapters.

#### Test Implementation

**Smoke Test Suite** (`partner-integration.test.js`):
- **Contract Validation**: Tests all `/api/ota/*` methods return expected schemas
- **Error Handling**: Validates proper error responses for edge cases
- **Authentication**: Ensures security requirements are met
- **Performance**: Checks response times and connection stability

**Test Categories:**
1. **Happy Path Tests**: Valid requests with expected responses
2. **Error Scenarios**: Invalid data, missing auth, non-existent resources
3. **Schema Validation**: Response structure consistency
4. **Security Tests**: Authentication and authorization checks

**CI Integration:**
- Automated test execution on pull requests
- Performance benchmarking
- Test result reporting
- Failure notifications

#### Adapter Compatibility

The test suite is designed to work with both:
- **Stub Implementation**: Mock partner APIs for development
- **Live Adapter**: Real partner API integrations for production

This ensures seamless switching between mock and production partner services.

## 🔧 Development Guide

### Adding New Partners

1. **Update mock data** in `/backend/routes/ota.js`
2. **Add partner logo** and branding assets
3. **Update frontend partner list** in Redux store
4. **Add smoke tests** for new partner endpoints
5. **Update documentation** with new partner details

### Extending Add-On Types

1. **Define new add-on type** in backend models
2. **Add UI components** for new add-on features
3. **Update purchase flow** in AddOnStore component
4. **Add validation logic** for new add-on types
5. **Create test cases** for new functionality

### Environment Configuration

**Development:**
- Local MongoDB instance
- Mock Stripe keys
- Debug logging enabled

**Production:**
- MongoDB Atlas cluster
- Live Stripe keys
- Error logging to external service
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **ESLint**: Follow React and accessibility best practices
- **Prettier**: Consistent code formatting
- **Tests**: All new features require tests
- **Documentation**: Update README for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Partner APIs**: Mock implementations based on common e-commerce patterns
- **Design System**: Tailwind CSS with WCAG AA compliance
- **Icons**: Lucide React icon library
- **Testing**: Jest and React Testing Library communities

---

**Built with ❤️ for the Actyme Platform Challenge**

For questions or support, please open an issue or contact the development team.