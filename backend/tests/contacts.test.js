const request = require('supertest');
const app = require('./app');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');

describe('Contacts API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(() => {
    teardownTestDatabase();
  });

  let contactId;

  describe('POST /api/contacts', () => {
    it('should create a new contact', async () => {
      const newContact = {
        name: 'John Doe',
        type: 'Employee',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        notes: 'Senior Developer'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(newContact)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Contact created successfully');
      contactId = response.body.id;
    });

    it('should fail to create contact without required fields', async () => {
      const invalidContact = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidContact)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/contacts', () => {
    it('should get all contacts', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter contacts by type', async () => {
      const response = await request(app)
        .get('/api/contacts?type=Employee')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(contact => {
        expect(contact.type).toBe('Employee');
      });
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should get a contact by id', async () => {
      const response = await request(app)
        .get(`/api/contacts/${contactId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', contactId);
      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('type', 'Employee');
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .get('/api/contacts/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Contact not found');
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update a contact', async () => {
      const updatedData = {
        name: 'John Doe Updated',
        type: 'Employee',
        email: 'john.updated@example.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        notes: 'Lead Developer'
      };

      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact updated successfully');

      // Verify update
      const getResponse = await request(app)
        .get(`/api/contacts/${contactId}`)
        .expect(200);

      expect(getResponse.body.name).toBe('John Doe Updated');
      expect(getResponse.body.notes).toBe('Lead Developer');
    });

    it('should return 404 when updating non-existent contact', async () => {
      const response = await request(app)
        .put('/api/contacts/99999')
        .send({ name: 'Test', type: 'Employee' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Contact not found');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete a contact', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${contactId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact deleted successfully');

      // Verify deletion
      await request(app)
        .get(`/api/contacts/${contactId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent contact', async () => {
      const response = await request(app)
        .delete('/api/contacts/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Contact not found');
    });
  });
});
