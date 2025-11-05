describe('Authentication API', () => {
  
  const baseUrl = 'http://localhost:8080'

  it('should register a new user', () => {

    cy.request({

      method: 'POST',
      url: `${baseUrl}/auth/register`,
      body: {
        email: 'blyat@example.com',
        username: 'blyat',
        password: 'Rushbcykablyat123!'

      }

    }).then((response) => {

      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('message')
      expect(response.body.user).to.have.property('email', 'blyat@example.com')

    })

  })

  it('should login with correct credentials', () => {

    cy.request({

      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: 'blyat@example.com',
        password: 'Rushbcykablyat123!'

      }

    }).then((response) => {

      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('message', 'Login successful')
      
      const cookies = response.headers['set-cookie']
      expect(cookies).to.exist

    })

  })

  it('should reject login with wrong password', () => {

    cy.request({

      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: 'blyat@example.com',
        password: 'wrongpassword'

      },
      failOnStatusCode: false

    }).then((response) => {

      expect(response.status).to.eq(403)
      expect(response.body).to.have.property('error')

    })

  })

})