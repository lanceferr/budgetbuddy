describe('Recurring Expenses Management', () => {

  beforeEach(() => {

    const timestamp = Date.now();
    const uniqueEmail = `test${timestamp}@example.com`;
    const uniqueUsername = `user${timestamp}`;

    cy.visit('http://localhost:5173/register');
    cy.get('input[id="username"]').type(uniqueUsername);
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type('TestPassword123!!!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    cy.contains('button', 'Recurring').click();
    cy.wait(500);

  });

  it('should create a new recurring expense successfully', () => {

    cy.get('input[placeholder="e.g., Netflix Subscription"]').type('Test Subscription');
    cy.get('input[type="number"][step="0.01"]').type('29.99');
    cy.get('select').first().select('Entertainment');
    cy.get('select').eq(1).select('monthly');
    
    cy.get('input[type="checkbox"]').uncheck();
    
    cy.contains('button', 'Create').click();
    
    cy.wait(1000);
    cy.contains('Test Subscription').should('be.visible');
    cy.contains('₱29.99').should('be.visible');
    cy.contains('Monthly').should('be.visible');

  });

  it('should edit an existing recurring expense', () => {

    cy.get('input[placeholder="e.g., Netflix Subscription"]').type('Original Name');
    cy.get('input[type="number"][step="0.01"]').type('15.00');
    cy.get('select').first().select('Food');
    cy.get('input[type="checkbox"]').uncheck();
    cy.contains('button', 'Create').click();
    
    cy.contains('Original Name', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', '✏️ Edit').click();
    
    cy.get('input[placeholder="e.g., Netflix Subscription"]').clear().type('Updated Name');
    cy.get('input[type="number"][step="0.01"]').clear().type('25.00');
    
    cy.contains('button', 'Update').click();
    cy.wait(1000);
    
    cy.contains('Updated Name').should('be.visible');
    cy.contains('₱25.00').should('be.visible');
    cy.contains('Original Name').should('not.exist');

  });

  it('should delete a recurring expense', () => {

    cy.get('input[placeholder="e.g., Netflix Subscription"]').type('To Be Deleted');
    cy.get('input[type="number"][step="0.01"]').type('10.00');
    cy.get('select').first().select('Other');
    cy.get('input[type="checkbox"]').uncheck();
    cy.contains('button', 'Create').click();
    
    cy.contains('To Be Deleted', { timeout: 5000 }).should('be.visible');
    cy.on('window:confirm', () => true);
    cy.contains('button', '🗑️ Delete').click();
    cy.wait(1000);
    
    cy.contains('To Be Deleted').should('not.exist');

  });

  it('should pause and resume a recurring expense', () => {

    cy.get('input[placeholder="e.g., Netflix Subscription"]').type('Pause Test');
    cy.get('input[type="number"][step="0.01"]').type('19.99');
    cy.get('select').first().select('Entertainment');
    cy.get('input[type="checkbox"]').first().uncheck();
    cy.contains('button', 'Create').click();
    
    cy.contains('Pause Test', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', '⏸️ Pause').click();
    cy.wait(1000);
    
    cy.contains('Show inactive').parent().find('input[type="checkbox"]').check();
    cy.wait(500);
    
    cy.contains('PAUSED').should('be.visible');
    cy.contains('button', '▶️ Resume').should('be.visible');
    
    cy.contains('button', '▶️ Resume').click();
    cy.wait(1000);
    
    cy.contains('Pause Test').should('be.visible');
    cy.contains('button', '⏸️ Pause').should('be.visible');
    cy.contains('PAUSED').should('not.exist');

  });

});