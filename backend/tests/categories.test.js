const request = require('supertest');
const app = require('./app');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');

describe('Categories API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(() => {
    teardownTestDatabase();
  });

  let categoryId;

  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2); // Setup creates 2 categories
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Meeting',
        description: 'Business meetings',
        color: '#EF4444'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Category created successfully');
      categoryId = response.body.id;
    });

    it('should fail to create category without name', async () => {
      const invalidCategory = {
        description: 'Test',
        color: '#000000'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create duplicate category', async () => {
      const duplicateCategory = {
        name: 'Meeting',
        description: 'Duplicate',
        color: '#000000'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(duplicateCategory)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get a category by id', async () => {
      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', categoryId);
      expect(response.body).toHaveProperty('name', 'Meeting');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/categories/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const updatedData = {
        name: 'Meeting Updated',
        description: 'Updated description',
        color: '#10B981'
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Category updated successfully');

      // Verify update
      const getResponse = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(getResponse.body.name).toBe('Meeting Updated');
      expect(getResponse.body.description).toBe('Updated description');
    });

    it('should return 404 when updating non-existent category', async () => {
      const response = await request(app)
        .put('/api/categories/99999')
        .send({ name: 'Test', description: 'Test', color: '#000000' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Category deleted successfully');

      // Verify deletion
      await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent category', async () => {
      const response = await request(app)
        .delete('/api/categories/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });
});
