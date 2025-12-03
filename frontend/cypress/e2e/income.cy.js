describe('Income Management', () => {

  beforeEach(() => {

    const timestamp = Date.now();
    const uniqueEmail = `alice${timestamp}@example.com`;
    const uniqueUsername = `alice${timestamp}`;

    cy.visit('http://localhost:5173/register');
    cy.get('input[id="username"]').type(uniqueUsername);
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type('AlicePass123!!!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    cy.contains('button', 'Income').click();
    cy.wait(500);

  });

  it('should create a new income entry', () => {

    cy.get('input[type="number"][step="0.01"]').type('5000');
    cy.get('select').select('Salary');
    cy.get('input[type="date"]').type('2025-12-01');
    cy.get('textarea').type('Monthly salary payment');
    
    cy.contains('button', 'Add Income').click();
    
    cy.wait(1000);
    
    cy.contains('₱5000.00').should('be.visible');
    cy.contains('Salary').should('be.visible');
    cy.contains('Monthly salary payment').should('be.visible');

  });

  it('should create income with all source types', () => {

    const sources = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 'Other'];
    
    sources.forEach((source, index) => {

      cy.get('input[type="number"][step="0.01"]').clear().type(`${(index + 1) * 100}`);
      cy.get('select').select(source);
      cy.contains('button', 'Add Income').click();
      cy.wait(500);

    });
    
    sources.forEach(source => {
      cy.contains(source).should('be.visible');
    });

  });

  it('should show total income calculation', () => {

    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.get('select').select('Salary');
    cy.contains('button', 'Add Income').click();
    cy.wait(500);
    
    cy.get('input[type="number"][step="0.01"]').clear().type('500');
    cy.get('select').select('Freelance');
    cy.contains('button', 'Add Income').click();
    cy.wait(500);
    
    cy.contains('Total Income').should('be.visible');
    cy.contains('₱1500.00').should('be.visible');

  });

  it('should edit an income entry', () => {

    cy.get('input[type="number"][step="0.01"]').type('2000');
    cy.get('select').select('Business');
    cy.get('textarea').type('Original note');
    cy.contains('button', 'Add Income').click();
    
    cy.wait(1000);
    cy.contains('₱2000.00', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', 'Edit').click();
    cy.contains('Edit Income').should('be.visible');
    
    cy.get('input[type="number"][step="0.01"]').clear().type('3500');
    cy.get('select').select('Investment');
    cy.get('textarea').clear().type('Updated note');
    
    cy.contains('button', 'Update').click();
    cy.wait(1000);
    
    cy.contains('₱3500.00').should('be.visible');
    cy.contains('Investment').should('be.visible');
    cy.contains('Updated note').should('be.visible');

  });

  it('should cancel edit without saving changes', () => {

    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.get('select').select('Gift');
    cy.contains('button', 'Add Income').click();
    cy.wait(1000);
    
    cy.contains('button', 'Edit').click();
    cy.get('input[type="number"][step="0.01"]').clear().type('9999');
    cy.contains('button', 'Cancel').click();
    
    cy.contains('₱1000.00').should('be.visible');
    cy.contains('₱9999.00').should('not.exist');

  });

  it('should delete an income entry', () => {

    cy.get('input[type="number"][step="0.01"]').type('750');
    cy.get('select').select('Refund');
    cy.contains('button', 'Add Income').click();
    
    cy.wait(1000);
    cy.contains('₱750.00', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', 'Delete').click();
    cy.wait(500);
    
    cy.contains('₱750.00').should('not.exist');

  });

  it('should reject invalid amount - zero', () => {

    cy.get('input[type="number"][step="0.01"]').type('0');
    cy.get('select').select('Salary');
    cy.contains('button', 'Add Income').click();
    
    cy.contains(/error|invalid|positive/i).should('be.visible');

  });

  it('should reject invalid amount - negative', () => {

    cy.get('input[type="number"][step="0.01"]').type('-100');
    cy.get('select').select('Salary');
    cy.contains('button', 'Add Income').click();
    
    cy.contains(/error|invalid|positive/i).should('be.visible');

  });

  it('should require source selection', () => {

    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.contains('button', 'Add Income').click();
    
    cy.get('select:invalid').should('exist');

  });

  it('should handle decimal amounts correctly', () => {

    cy.get('input[type="number"][step="0.01"]').type('1234.56');
    cy.get('select').select('Freelance');
    cy.contains('button', 'Add Income').click();
    
    cy.wait(1000);
    cy.contains('₱1234.56').should('be.visible');

  });

  it('should display empty state when no income entries', () => {

    cy.contains('No Income Entries Yet').should('be.visible');
    cy.contains('Add your first income entry to start tracking').should('be.visible');

  });

  it('should sort income entries by date', () => {

    cy.get('input[type="number"][step="0.01"]').type('100');
    cy.get('select').select('Salary');
    cy.get('input[type="date"]').type('2025-12-01');
    cy.contains('button', 'Add Income').click();
    cy.wait(500);
    
    cy.get('input[type="number"][step="0.01"]').clear().type('200');
    cy.get('select').select('Freelance');
    cy.get('input[type="date"]').clear().type('2025-12-03');
    cy.contains('button', 'Add Income').click();
    cy.wait(1000);
    
    cy.get('body').then($body => {
      const text = $body.text();
      const index200 = text.indexOf('₱200.00');
      const index100 = text.indexOf('₱100.00');
      expect(index200).to.be.lessThan(index100);
    });

  });

});