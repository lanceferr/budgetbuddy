describe('Authentication Flow', () => {
  
  beforeEach(() => {

    cy.visit('http://localhost:5173')

  })

  it('should register a new user', () => {
    
    cy.contains('Get Started').click()
    
    cy.url().should('include', '/register')
    
    cy.get('input[type="text"]').type(`Bread`)
    cy.get('input[type="email"]').type(`bread@example.com`)
    cy.get('input[type="password"]').type('TestPass123!@#')
    
    cy.contains('button', 'Create Account').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')

  })

  it('should login with existing credentials', () => {

    cy.contains('Login').click()
    
    cy.url().should('include', '/login')

    cy.get('input[type="email"]').type(`bread@example.com`)
    cy.get('input[type="password"]').type(`TestPass123!@#`)

    cy.contains('button', 'Login').click()
    
    cy.url({ timeout: 10000 }).should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')

  })

  it('should show error with wrong password', () => {

    cy.contains('Login').click()
    
    cy.get('input[type="email"]').type('bread@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    
    cy.contains('button', 'Login').click()
    
    cy.url().should('include', '/login')
    cy.contains(/error|failed|invalid/i).should('be.visible')

  })

  it('should show error with wrong email', () => {

    cy.contains('Login').click()
    
    cy.get('input[type="email"]').type('blyat@example.com')
    cy.get('input[type="password"]').type('TestPass123!@#')
    
    cy.contains('button', 'Login').click()
    
    cy.url().should('include', '/login')
    cy.contains(/error|failed|invalid/i).should('be.visible')

  })

})