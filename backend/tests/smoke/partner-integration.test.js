const request = require('supertest');
const app = require('../../server');

describe('Partner Integration Smoke Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'smoketest@actyme.com',
        password: 'password123'
      });
    
    authToken = registerResponse.body.data.token;
  });

  describe('Partner Endpoints', () => {
    test('GET /api/ota/partners should return partner list', async () => {
      const response = await request(app)
        .get('/api/ota/partners')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Validate partner structure
      const partner = response.body.data[0];
      expect(partner).toHaveProperty('id');
      expect(partner).toHaveProperty('name');
      expect(partner).toHaveProperty('logo');
      expect(partner).toHaveProperty('apiEndpoint');
      expect(partner).toHaveProperty('supportedTypes');
      expect(partner).toHaveProperty('categories');
    });

    test('GET /api/ota/vouchers should return voucher templates', async () => {
      const response = await request(app)
        .get('/api/ota/vouchers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Validate voucher structure
      const voucher = response.body.data[0];
      expect(voucher).toHaveProperty('id');
      expect(voucher).toHaveProperty('title');
      expect(voucher).toHaveProperty('description');
      expect(voucher).toHaveProperty('value');
      expect(voucher).toHaveProperty('pointsCost');
      expect(voucher).toHaveProperty('partner');
    });

    test('POST /api/ota/vouchers/create should create voucher with valid data', async () => {
      const response = await request(app)
        .post('/api/ota/vouchers/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voucherId: 'amazon-10',
          userPoints: 1000
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('template');
      expect(response.body.data).toHaveProperty('partner');
      expect(response.body.data).toHaveProperty('status', 'active');
      expect(response.body.data).toHaveProperty('redemptionUrl');
    });

    test('POST /api/ota/vouchers/create should fail with insufficient points', async () => {
      const response = await request(app)
        .post('/api/ota/vouchers/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voucherId: 'amazon-10',
          userPoints: 50 // Less than required 100 points
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient points');
    });

    test('GET /api/ota/addons should return add-on products', async () => {
      const response = await request(app)
        .get('/api/ota/addons')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Validate add-on structure
      const addon = response.body.data[0];
      expect(addon).toHaveProperty('id');
      expect(addon).toHaveProperty('title');
      expect(addon).toHaveProperty('description');
      expect(addon).toHaveProperty('price');
      expect(addon).toHaveProperty('type');
    });

    test('POST /api/ota/addons/purchase should process add-on purchase', async () => {
      const response = await request(app)
        .post('/api/ota/addons/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          addonId: 'premium-boost',
          paymentMethodId: 'pm_test_card'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('addon');
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(response.body.data).toHaveProperty('paymentIntentId');
    });

    test('POST /api/ota/test-connection should validate partner connection', async () => {
      const response = await request(app)
        .post('/api/ota/test-connection')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partnerId: 'amazon'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('partnerId', 'amazon');
      expect(response.body.data).toHaveProperty('status', 'connected');
      expect(response.body.data).toHaveProperty('latency');
      expect(response.body.data).toHaveProperty('testedAt');
    });
  });

  describe('Error Handling', () => {
    test('Should require authentication for all endpoints', async () => {
      await request(app)
        .get('/api/ota/partners')
        .expect(401);

      await request(app)
        .get('/api/ota/vouchers')
        .expect(401);

      await request(app)
        .post('/api/ota/vouchers/create')
        .send({ voucherId: 'test' })
        .expect(401);
    });

    test('Should validate request data', async () => {
      // Missing voucherId
      await request(app)
        .post('/api/ota/vouchers/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userPoints: 100 })
        .expect(400);

      // Missing addonId
      await request(app)
        .post('/api/ota/addons/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    test('Should handle non-existent resources', async () => {
      // Non-existent voucher
      await request(app)
        .post('/api/ota/vouchers/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voucherId: 'non-existent',
          userPoints: 1000
        })
        .expect(404);

      // Non-existent partner
      await request(app)
        .post('/api/ota/test-connection')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          partnerId: 'non-existent'
        })
        .expect(404);
    });
  });

  describe('Response Schema Validation', () => {
    test('Partner response should match expected schema', async () => {
      const response = await request(app)
        .get('/api/ota/partners')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number)
      });
    });

    test('Voucher creation response should match expected schema', async () => {
      const response = await request(app)
        .post('/api/ota/vouchers/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voucherId: 'starbucks-5',
          userPoints: 1000
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          id: expect.any(String),
          code: expect.any(String),
          template: expect.any(Object),
          partner: expect.any(Object),
          status: 'active',
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          redemptionUrl: expect.any(String)
        }
      });
    });

    test('Add-on purchase response should match expected schema', async () => {
      const response = await request(app)
        .post('/api/ota/addons/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          addonId: 'task-unlock',
          paymentMethodId: 'pm_test_card'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          id: expect.any(String),
          addon: expect.any(Object),
          userId: expect.any(String),
          amount: expect.any(Number),
          currency: expect.any(String),
          status: 'completed',
          paymentIntentId: expect.any(String),
          purchasedAt: expect.any(String)
        }
      });
    });
  });
});