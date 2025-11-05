describe('Security Tests', () => {
  
  beforeEach(() => {

    cy.visit('http://localhost:5173')

  })

  it('should reject weak passwords during registration', () => {

    cy.contains('Get Started').click()
    
    cy.get('input[type="text"]').type('testuser')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('weak')
    
    cy.contains('button', 'Create Account').click()
    
    cy.url().should('include', '/register')
    cy.get('body').should('contain.text', 'Password must be at least 8 characters long')

  })

  it('should reject invalid email format', () => {

    cy.contains('Get Started').click()
    
    cy.get('input[type="text"]').type('testuser')
    cy.get('input[type="email"]').type('notanemail')
    cy.get('input[type="password"]').type('StrongPass123!@#')
    
    cy.contains('button', 'Create Account').click()
    
    cy.url().should('include', '/register')

  })

  it('should reject already registered username', () => {

    cy.contains('Get Started').click()
    
    cy.get('input[type="text"]').type('Bread')
    cy.get('input[type="email"]').type('newemail@example.com')
    cy.get('input[type="password"]').type('StrongPass123!@#')
    
    cy.contains('button', 'Create Account').click()
    
    cy.url().should('include', '/register')

    cy.get('body').should('contain.text', 'User already exists')

  })

  it('should reject already registered email', () => {

    cy.contains('Get Started').click()
    
    cy.get('input[type="text"]').type('newuser')
    cy.get('input[type="email"]').type('bread@example.com')
    cy.get('input[type="password"]').type('StrongPass123!@#')
    
    cy.contains('button', 'Create Account').click()
    
    cy.url().should('include', '/register')

    cy.get('body').should('contain.text', 'E-mail already registered')

  })

  it('should redirect to login when accessing dashboard without auth', () => {

    cy.visit('http://localhost:5173/dashboard')
    
    cy.url().should('not.include', '/dashboard')
    cy.url().should('match', /\/(login)?$/)

  })

  it('should logout and redirect to log in', () => {

    cy.contains('Login').click()
    cy.get('input[type="email"]').type('bread@example.com')
    cy.get('input[type="password"]').type('TestPass123!@#')
    cy.contains('button', 'Login').click()
    
    cy.url({ timeout: 10000 }).should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
    
    cy.contains('button', 'Logout').click()
    
    cy.url().should('not.include', '/dashboard')
    cy.contains('Budget Buddy').should('be.visible')
    
  })

})