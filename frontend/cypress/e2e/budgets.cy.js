describe('Budget Management', () => {

  beforeEach(() => {

    const timestamp = Date.now();
    const uniqueEmail = `budget${timestamp}@example.com`;
    const uniqueUsername = `budgetuser${timestamp}`;

    cy.visit('http://localhost:5173/register');
    cy.get('input[id="username"]').type(uniqueUsername);
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type('TestPassword123!!!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    cy.contains('button', 'Budgets').click();
    cy.wait(500);

  });

  it('should create a new monthly budget for a category', () => {

    cy.get('input[type="number"][step="0.01"]').type('5000');
    cy.get('select').first().select('Monthly');
    cy.get('select').eq(1).select('Food');
    
    cy.contains('button', 'Create').click();
    
    cy.wait(1000);
    
    cy.contains('Food • monthly').should('be.visible');
    cy.contains('Amount: ₱5000.00').should('be.visible');
    cy.contains('Spent: ₱0.00').should('be.visible');

  });

  it('should create an overall weekly budget', () => {

    cy.get('input[type="number"][step="0.01"]').type('1500');
    cy.get('select').first().select('Weekly');
    
    cy.contains('button', 'Create').click();
    cy.wait(1000);
    
    cy.contains('Overall • weekly').should('be.visible');
    cy.contains('Amount: ₱1500.00').should('be.visible');

  });

  it('should edit an existing budget', () => {

    cy.get('input[type="number"][step="0.01"]').type('2000');
    cy.get('select').first().select('Monthly');
    cy.get('select').eq(1).select('Transport');
    cy.contains('button', 'Create').click();
    
    cy.wait(1000);
    cy.contains('Transport • monthly', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', 'Edit').click();
    cy.contains('Edit Budget').should('be.visible');
    cy.get('input[type="number"][step="0.01"]').clear().type('3500');
    cy.get('select').first().select('Weekly');
    
    cy.contains('button', 'Update').click();
    cy.wait(1000);
    
    cy.contains('Transport • weekly').should('be.visible');
    cy.contains('Amount: ₱3500.00').should('be.visible');

  });

  it('should delete a budget', () => {

    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.get('select').first().select('Monthly');
    cy.get('select').eq(1).select('Entertainment');
    cy.contains('button', 'Create').click();
    
    cy.wait(1000);
    cy.contains('Entertainment • monthly', { timeout: 5000 }).should('be.visible');
    
    cy.on('window:confirm', () => true);
    cy.contains('button', 'Delete').click();
    
    cy.wait(1000);
    cy.contains('Entertainment • monthly').should('not.exist');

  });

  it('should display empty state when no budgets exist', () => {

    cy.contains('No budgets yet. Create one to get alerts.').should('be.visible');
    cy.contains('Your Budgets').should('be.visible');

  });

  it('should show all category options in dropdown', () => {

    cy.get('select').eq(1).should('be.visible');
    
    cy.get('select').eq(1).find('option').should('have.length', 8);
    cy.get('select').eq(1).find('option').eq(0).should('contain', 'Overall');
    cy.get('select').eq(1).find('option').eq(1).should('contain', 'Food');
    cy.get('select').eq(1).find('option').eq(2).should('contain', 'Transport');
    cy.get('select').eq(1).find('option').eq(3).should('contain', 'Entertainment');
    cy.get('select').eq(1).find('option').eq(4).should('contain', 'Shopping');
    cy.get('select').eq(1).find('option').eq(5).should('contain', 'Bills');
    cy.get('select').eq(1).find('option').eq(6).should('contain', 'Health');
    cy.get('select').eq(1).find('option').eq(7).should('contain', 'Other');
  });

  it('should show both period options in dropdown', () => {

    cy.get('select').first().should('be.visible');
    cy.get('select').first().find('option').should('have.length', 2);
    cy.get('select').first().find('option').eq(0).should('contain', 'Monthly');
    cy.get('select').first().find('option').eq(1).should('contain', 'Weekly');

  });

  it('should cancel edit mode and reset form', () => {

    cy.get('input[type="number"][step="0.01"]').type('800');
    cy.get('select').first().select('Weekly');
    cy.get('select').eq(1).select('Health');
    cy.contains('button', 'Create').click();
    
    cy.wait(1000);
    cy.contains('Health • weekly', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', 'Edit').click();
    cy.contains('Edit Budget').should('be.visible');
    cy.get('input[type="number"][step="0.01"]').clear().type('1200');
    cy.contains('button', 'Cancel').click();
    
    cy.contains('Create Budget').should('be.visible');
    cy.get('input[type="number"][step="0.01"]').should('have.value', '');
    
    cy.contains('Health • weekly').should('be.visible');
    cy.contains('Amount: ₱800.00').should('be.visible');

  });

});