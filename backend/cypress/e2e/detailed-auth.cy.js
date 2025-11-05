// Tests user registration and login flow

describe('Authentication Flow', () => {
  const baseUrl = 'http://localhost:8080';

  // Helper to generate unique user data for each test
  const generateTestUser = () => ({
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#'
  });

  it('should register a new user successfully', () => {
    const testUser = generateTestUser();
    
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password
      }
    }).then((response) => {
      // Check response status - backend returns 201 for registration
      expect(response.status).to.eq(201);
      
      // Check response has required fields
      expect(response.body).to.have.property('message', 'Registration successful');
      expect(response.body.user).to.have.property('email', testUser.email);
      expect(response.body.user).to.have.property('username', testUser.username);
      
      // Verify password is not returned
      expect(response.body.user).to.not.have.property('password');
    });
  });

  it('should login with correct credentials', () => {
    const testUser = generateTestUser();
    
    // First register the user
    cy.request('POST', `${baseUrl}/auth/register`, testUser);

    // Then login
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Login successful');
      
      // Check session cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).to.exist;
      expect(cookies[0]).to.include('AUTH'); // Your cookie name is 'AUTH'
    });
  });

  it('should reject login with wrong password', () => {
    const testUser = generateTestUser();
    
    // Register user first
    cy.request('POST', `${baseUrl}/auth/register`, testUser);

    // Try login with wrong password
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: 'WrongPass123!@#'
      },
      failOnStatusCode: false // Don't fail the test on error status
    }).then((response) => {
      // Backend returns 403 for wrong password
      expect(response.status).to.eq(403);
      expect(response.body).to.have.property('error', 'Invalid credentials');
    });
  });

  it('should reject registration with duplicate email', () => {
    const testUser = generateTestUser();
    
    // Register once
    cy.request('POST', `${baseUrl}/auth/register`, testUser);

    // Try to register again with same email
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: testUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.eq('User already exists');
    });
  });

  it('should logout successfully', () => {
    const testUser = generateTestUser();
    
    // Register and login first
    cy.request('POST', `${baseUrl}/auth/register`, testUser);
    
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password
      }
    }).then((loginResponse) => {
      const sessionCookie = loginResponse.headers['set-cookie'][0];

      // Logout
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/logout`,
        headers: {
          Cookie: sessionCookie
        }
      }).then((logoutResponse) => {
        expect(logoutResponse.status).to.eq(200);
      });
    });
  });
});