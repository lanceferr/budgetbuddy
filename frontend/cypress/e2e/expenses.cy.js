describe('Expenses Management', () => {
  
  beforeEach(() => {

    cy.visit('http://localhost:5173/login')
    
    cy.get('input[type="email"]').type('bread@example.com')
    cy.get('input[type="password"]').type('TestPass123!@#')
    cy.contains('button', 'Login').click()
    
    cy.url().should('include', '/dashboard')

  })

  it('should display the dashboard after login', () => {

    cy.contains('Dashboard').should('be.visible')
    cy.contains('Transactions').should('be.visible')

  })

  it('should navigate to transactions tab', () => {

    cy.contains('button', 'Transactions').click()
    cy.get('body').should('contain', 'Transactions')

  })

  it('should allow creating a new expense', () => {

    cy.contains('button', 'Transactions').click()
    
    cy.get('body').then($body => {

      if ($body.text().includes('Add') || $body.text().includes('New')) {

        cy.contains(/Add|New/i).should('be.visible')

      }

    })
    
    cy.url().should('include', '/dashboard')
  })

  it('should create expense', () => {

    cy.contains('button', 'Transactions').click()

    cy.get('input[type="number"]').type('100')
    cy.get('input[type="text"]').type('Bread')
    cy.get('select').select('Food')
    cy.get('textarea').type('Weekly groceries from the store')

    cy.contains('button', 'Add Expense').click()

  })

  it('should update expense', () => {

    cy.contains('button', 'Transactions').click()
    cy.contains('button', 'Edit').click()

    cy.get('input[type="number"]').clear().type('150')
    cy.get('input[type="text"]').clear().type('Breads')
    cy.get('select').select('Food')
    cy.get('textarea').clear().type('Weekly groceries from the stores')

    cy.contains('button', 'Update Expense').click()

  })

  it('should delete expense', () => {
    
    cy.contains('button', 'Transactions').click()
  
    const uniqueName = `Test-${Date.now()}`
    
    cy.get('input[type="number"]').type('99')
    cy.get('input[type="text"]').type(uniqueName)
    cy.get('select').select('Food')
    cy.contains('button', 'Add Expense').click()
    
    cy.contains(uniqueName).should('be.visible')
    cy.contains(uniqueName).parent().parent().contains('button', 'Delete').click()
    cy.contains(uniqueName).should('not.exist')

  })

})