# Actyme Platform Demo Guide

## 🎯 Quick Demo Walkthrough

This guide provides a step-by-step demonstration of the Actyme platform's key features, specifically focusing on the M27 and M28 module requirements.

## 🚀 Getting Started

### 1. Access the Platform

**Live Demo**: https://actyme-platform.vercel.app
**API Endpoint**: https://actyme-api.herokuapp.com

### 2. Demo Account Login

Use these pre-configured credentials:
- **Email**: `demo@actyme.com`
- **Password**: `password123`

Or create a new account using the registration form.

## 📱 Platform Features Demo

### Dashboard Overview

Upon login, you'll see the main dashboard with:
- **Current Points**: Your accumulated reward points (starts with 100 welcome bonus)
- **Current Level**: Your user level based on points earned
- **Rewards Earned**: Number of vouchers you've redeemed
- **Tasks Completed**: Number of activities you've finished

### Navigation

The platform features a collapsible sidebar with three main sections:
- **Dashboard**: Overview and quick actions
- **My Rewards**: Voucher marketplace and redemption center
- **Add-On Store**: Premium purchases and boosts

## 🎁 M27 Demo: My Rewards & Redemptions

### Step 1: Navigate to My Rewards

Click on "My Rewards" in the sidebar or use the dashboard quick action card.

### Step 2: Explore Available Rewards

You'll see the rewards interface with two tabs:
- **Available Rewards**: Vouchers you can redeem with points
- **My Vouchers**: Your redeemed vouchers and their status

### Step 3: Filter and Browse Vouchers

**Available filters:**
- **Category**: Dining, Shopping, Travel, Entertainment
- **Partner**: Amazon, Starbucks, Uber
- **Points Range**: Slider to set maximum points to spend

**Demo vouchers include:**
- **$10 Amazon Gift Card** (100 points)
- **$5 Starbucks Card** (50 points)  
- **$15 Uber Credit** (150 points)

### Step 4: Redeem a Voucher

1. **Select a voucher** within your points budget
2. **Click "Redeem Voucher"** button
3. **Confirm the redemption** (points will be deducted automatically)
4. **Receive voucher details** including:
   - Unique voucher code
   - QR code for easy redemption
   - Expiration date
   - Direct redemption link

### Step 5: Manage Your Vouchers

Switch to the "My Vouchers" tab to:
- **View all redeemed vouchers**
- **Check voucher status** with partner APIs
- **Access redemption links** and QR codes
- **Monitor expiration dates**

### API Integration Demonstration

The My Rewards component integrates with these `/api/ota/*` endpoints:
- `GET /api/ota/vouchers` - Fetches available voucher templates
- `POST /api/ota/vouchers/create` - Redeems points for vouchers
- `GET /api/ota/vouchers/:id/status` - Checks voucher status with partners

## 🛒 M27 Demo: Add-On Store

### Step 1: Navigate to Add-On Store

Click on "Add-On Store" in the sidebar or dashboard quick action.

### Step 2: Browse Premium Add-Ons

**Available add-on types:**
- **Point Boosts**: Multiply your earning rate
- **Content Packs**: Unlock exclusive tasks
- **Progression**: Skip levels or gain instant rewards

**Demo add-ons include:**
- **Premium Point Boost**: 2x points for 7 days ($4.99)
- **Exclusive Task Pack**: 5 high-value tasks ($9.99)
- **Level Skip Token**: Advance one level instantly ($2.99)

### Step 3: Purchase an Add-On

1. **Select an add-on** you want to purchase
2. **Click "Purchase Now"** to open the purchase modal
3. **Review purchase details** and pricing
4. **Confirm payment** using the mock Stripe integration
5. **Receive confirmation** and add-on activation

### Step 4: View Purchase History

Scroll down to see your "Recent Purchases" with:
- **Purchase details** and dates
- **Add-on status** and activation
- **Expiration dates** for time-limited boosts

### API Integration Demonstration

The Add-On Store integrates with:
- `GET /api/ota/addons` - Fetches available add-on products
- `POST /api/ota/addons/purchase` - Processes purchases via Stripe
- Mock Stripe payment processing in test mode

## 🧪 M28 Demo: Partner Integration Testing

### Smoke Test Validation

The platform includes comprehensive smoke tests that validate:

#### 1. Partner Interface Contracts

**Test Coverage:**
- All `/api/ota/*` endpoints return expected response schemas
- Error handling for invalid requests and edge cases
- Authentication requirements for protected endpoints
- Response time and connection stability

#### 2. Adapter Compatibility

**Dual Implementation Support:**
- **Stub Adapters**: Mock partner APIs for development and testing
- **Live Adapters**: Real partner integrations for production
- Seamless switching between implementations

### Running Smoke Tests

**Backend tests:**
```bash
cd backend
npm run smoke-test
```

**Test categories:**
- ✅ **Happy Path Tests**: Valid requests with expected responses
- ✅ **Error Scenarios**: Invalid data, authentication failures
- ✅ **Schema Validation**: Response structure consistency
- ✅ **Security Tests**: Authorization and rate limiting

### API Contract Examples

**Partner List Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "amazon",
      "name": "Amazon",
      "logo": "partner_logo_url",
      "apiEndpoint": "https://api.amazon.com/vouchers",
      "supportedTypes": ["voucher", "discount"],
      "categories": ["shopping", "electronics"]
    }
  ],
  "count": 3
}
```

**Voucher Creation Response:**
```json
{
  "success": true,
  "data": {
    "id": "voucher_1234567890",
    "code": "ACT-AMAZON-10-567890",
    "status": "active",
    "redemptionUrl": "https://redeem.amazon.com/...",
    "expiresAt": "2024-04-15T10:30:00Z"
  }
}
```

## 🔄 End-to-End User Flow

### Complete User Journey

1. **Registration/Login** → Get welcome bonus points
2. **Explore Dashboard** → View stats and quick actions
3. **Browse Rewards** → Filter and find desired vouchers
4. **Redeem Voucher** → Exchange points for partner vouchers
5. **Purchase Add-Ons** → Buy premium features with Stripe
6. **Manage Assets** → Track vouchers and purchases

### Real-Time Updates

The platform provides real-time updates for:
- **Point balance** changes after redemptions
- **Level progression** based on activity
- **Voucher status** from partner APIs
- **Purchase confirmations** and activations

## 🎥 Video Demo Script

### 30-Second Quick Demo

1. **Login** (5s): Show authentication flow
2. **Dashboard** (5s): Highlight key metrics and navigation
3. **Rewards** (10s): Browse, filter, and redeem a voucher
4. **Store** (10s): Purchase an add-on with mock payment

### 2-Minute Detailed Demo

1. **Introduction** (15s): Platform overview and purpose
2. **Authentication** (15s): Login process and user onboarding
3. **Dashboard Tour** (30s): Navigate interface and explain features
4. **Rewards Flow** (45s): Complete voucher redemption process
5. **Add-On Purchase** (30s): Buy premium feature with payment
6. **Technical Demo** (5s): Show API responses and testing

## 📊 Performance Metrics

### Key Performance Indicators

- **API Response Time**: < 500ms for all endpoints
- **Page Load Speed**: < 2s for initial load
- **Test Coverage**: > 85% for critical paths
- **Accessibility**: WCAG AA compliant
- **Mobile Responsiveness**: Works on all device sizes

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔧 Developer Demo Features

### Code Quality

- **TypeScript**: Type-safe development
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks

### Testing Strategy

- **Unit Tests**: Component and function testing
- **Integration Tests**: API and user flow testing
- **Smoke Tests**: Partner interface validation
- **E2E Tests**: Complete user journey testing

### Deployment Pipeline

- **CI/CD**: Automated testing and deployment
- **Staging**: Preview environment for testing
- **Production**: Live platform with monitoring
- **Rollback**: Quick revert capability for issues

## 🎯 Success Criteria

### M27 Completion Checklist

- ✅ MyRewards component fully integrated with OTA endpoints
- ✅ AddOnStore component with complete purchase flow
- ✅ Redux state management for partner data
- ✅ Mock-driven development and testing
- ✅ End-to-end user flows validated

### M28 Completion Checklist

- ✅ Comprehensive smoke test suite implemented
- ✅ Partner interface contract validation
- ✅ Schema consistency across all endpoints
- ✅ Error handling for edge cases
- ✅ Adapter compatibility for stub/live switching
- ✅ CI integration with automated testing

---

**Demo completed! 🎉**

For technical questions or detailed implementation discussion, please refer to the main README.md or contact the development team.