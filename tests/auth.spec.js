const request = require('supertest');
const app = require("../server")


// Example user data for testing
const mockUser = {
    userId: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    password: 'password',
    phone: '123-456-7890'
  };

describe('User API Endpoint Tests', () => {
  
    // Test for GET /api/users/:userId
    describe('GET /api/users/:userId', () => {
      
      test('should return 404 if user not found', async () => {
        const nonExistentUserId = '999'; // Assuming this user ID does not exist
        
        const response = await request(app).get(`/api/users/${nonExistentUserId}`);
        
        // Assert response status
        expect(response.status).toBe(404);
      });
    });
    
    // Add more tests for other endpoints if needed
    
  });