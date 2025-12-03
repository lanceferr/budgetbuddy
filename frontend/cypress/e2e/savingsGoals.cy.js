describe('Savings Goals Management', () => {

  beforeEach(() => {

    const timestamp = Date.now();
    const uniqueEmail = `bob${timestamp}@example.com`;
    const uniqueUsername = `bob${timestamp}`;

    cy.visit('http://localhost:5173/register');
    cy.get('input[id="username"]').type(uniqueUsername);
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type('BobPass123!!!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    cy.contains('button', 'Savings').click();
    cy.wait(500);

  });

  it('should create a new savings goal', () => {

    cy.get('input[type="text"]').type('Emergency Fund');
    cy.get('input[type="number"][step="0.01"]').type('10000');
    cy.get('input[type="date"]').type('2026-06-30');
    cy.get('textarea').type('Save for 6 months expenses');
    
    cy.contains('button', 'Create Goal').click();
    
    cy.wait(1000);
    
    cy.contains('Emergency Fund').should('be.visible');
    cy.contains('₱10000.00').should('be.visible');
    cy.contains('Save for 6 months expenses').should('be.visible');

  });

  it('should display dashboard stats', () => {

    cy.contains('Total Saved').should('be.visible');
    cy.contains('Total Target').should('be.visible');
    cy.contains('Active Goals').should('be.visible');
    cy.contains('Savings Rate').should('be.visible');

  });

  it('should show 0% progress for new goal', () => {

    cy.get('input[type="text"]').type('Vacation Fund');
    cy.get('input[type="number"][step="0.01"]').type('5000');
    cy.get('input[type="date"]').type('2026-12-31');
    cy.contains('button', 'Create Goal').click();
    
    cy.wait(1000);
    cy.contains('0%').should('be.visible');
    cy.contains('₱0.00 / ₱5000.00').should('be.visible');

  });

  it('should add a contribution to a goal', () => {

    cy.get('input[type="text"]').type('New Car');
    cy.get('input[type="number"][step="0.01"]').type('50000');
    cy.get('input[type="date"]').type('2027-01-01');
    cy.contains('button', 'Create Goal').click();
    
    cy.wait(1000);
    cy.contains('button', 'Add Money').click();
    
    cy.get('input[type="number"][step="0.01"]').last().type('5000');
    cy.contains('button', 'Add').click();
    
    cy.wait(1000);
    cy.contains('₱5000.00').should('be.visible');
    cy.contains('10%').should('be.visible');

  });

  it('should add multiple contributions to a goal', () => {

    cy.get('input[type="text"]').type('House Down Payment');
    cy.get('input[type="number"][step="0.01"]').type('100000');
    cy.get('input[type="date"]').type('2028-01-01');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('10000');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('15000');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('₱25000.00').should('be.visible');
    cy.contains('25%').should('be.visible');

  });

  it('should show completed badge when goal reaches 100%', () => {

    cy.get('input[type="text"]').type('Small Goal');
    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.get('input[type="date"]').type('2026-01-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('1000');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('COMPLETED').should('be.visible');
    cy.contains('100%').should('be.visible');

  });

  it('should handle over-contribution (>100%)', () => {

    cy.get('input[type="text"]').type('Quick Goal');
    cy.get('input[type="number"][step="0.01"]').type('500');
    cy.get('input[type="date"]').type('2026-02-28');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('750');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('₱750.00').should('be.visible');
    cy.contains('COMPLETED').should('be.visible');

  });

  it('should cancel contribution without saving', () => {

    cy.get('input[type="text"]').type('Test Goal');
    cy.get('input[type="number"][step="0.01"]').type('2000');
    cy.get('input[type="date"]').type('2026-03-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('999');
    cy.contains('button', 'Cancel').last().click();
    
    cy.contains('₱0.00 / ₱2000.00').should('be.visible');
    cy.contains('₱999.00').should('not.exist');

  });

  it('should edit a savings goal', () => {

    cy.get('input[type="text"]').type('Original Goal');
    cy.get('input[type="number"][step="0.01"]').type('3000');
    cy.get('input[type="date"]').type('2026-04-30');
    cy.get('textarea').type('Original note');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Edit').click();
    cy.contains('Edit Savings Goal').should('be.visible');
    
    cy.get('input[type="text"]').clear().type('Updated Goal');
    cy.get('input[type="number"][step="0.01"]').clear().type('5000');
    cy.get('textarea').clear().type('Updated note');
    
    cy.contains('button', 'Update').click();
    cy.wait(1000);
    
    cy.contains('Updated Goal').should('be.visible');
    cy.contains('₱5000.00').should('be.visible');
    cy.contains('Updated note').should('be.visible');

  });

  it('should cancel edit without saving changes', () => {

    cy.get('input[type="text"]').type('Cancel Test');
    cy.get('input[type="number"][step="0.01"]').type('1500');
    cy.get('input[type="date"]').type('2026-05-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Edit').click();
    cy.get('input[type="text"]').clear().type('Should Not Save');
    cy.contains('button', 'Cancel').click();
    
    cy.contains('Cancel Test').should('be.visible');
    cy.contains('Should Not Save').should('not.exist');

  });

  it('should delete a savings goal', () => {

    cy.get('input[type="text"]').type('Delete Me');
    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.get('input[type="date"]').type('2026-06-30');
    cy.contains('button', 'Create Goal').click();
    
    cy.wait(1000);
    cy.contains('Delete Me', { timeout: 5000 }).should('be.visible');
    
    cy.contains('button', 'Delete').click();
    cy.wait(500);
    
    cy.contains('Delete Me').should('not.exist');

  });

  it('should reject invalid target amount - zero', () => {

    cy.get('input[type="text"]').type('Invalid Goal');
    cy.get('input[type="number"][step="0.01"]').type('0');
    cy.get('input[type="date"]').type('2026-07-31');
    cy.contains('button', 'Create Goal').click();
    
    cy.contains(/error|invalid|positive/i).should('be.visible');

  });

  it('should reject invalid target amount - negative', () => {

    cy.get('input[type="text"]').type('Negative Goal');
    cy.get('input[type="number"][step="0.01"]').type('-500');
    cy.get('input[type="date"]').type('2026-08-31');
    cy.contains('button', 'Create Goal').click();
    
    cy.contains(/error|invalid|positive/i).should('be.visible');

  });

  it('should reject invalid contribution - zero', () => {

    cy.get('input[type="text"]').type('Test Goal');
    cy.get('input[type="number"][step="0.01"]').type('1000');
    cy.get('input[type="date"]').type('2026-09-30');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('0');
    cy.contains('button', 'Add').click();
    
    cy.wait(500);
    cy.contains('Please enter a valid contribution amount').should('be.visible');

  });

  it('should reject invalid contribution - negative', () => {

    cy.get('input[type="text"]').type('Test Goal 2');
    cy.get('input[type="number"][step="0.01"]').type('2000');
    cy.get('input[type="date"]').type('2026-10-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('-100');
    cy.contains('button', 'Add').click();
    
    cy.wait(500);
    cy.contains('Please enter a valid contribution amount').should('be.visible');

  });

  it('should update dashboard stats when creating goals', () => {

    cy.contains('Active Goals').parent().should('contain', '0');
    
    cy.get('input[type="text"]').type('First Goal');
    cy.get('input[type="number"][step="0.01"]').type('5000');
    cy.get('input[type="date"]').type('2026-11-30');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('Active Goals').parent().should('contain', '1');
    cy.contains('Total Target').parent().should('contain', '₱5000.00');

  });

  it('should update dashboard stats when adding contributions', () => {

    cy.get('input[type="text"]').type('Stats Test');
    cy.get('input[type="number"][step="0.01"]').type('10000');
    cy.get('input[type="date"]').type('2026-12-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('Total Saved').parent().should('contain', '₱0.00');
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('2000');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('Total Saved').parent().should('contain', '₱2000.00');

  });

  it('should handle decimal amounts correctly', () => {

    cy.get('input[type="text"]').type('Decimal Goal');
    cy.get('input[type="number"][step="0.01"]').type('1234.56');
    cy.get('input[type="date"]').type('2027-01-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('₱1234.56').should('be.visible');
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('567.89');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('₱567.89').should('be.visible');

  });

  it('should display empty state when no goals exist', () => {

    cy.contains('No Savings Goals Yet').should('be.visible');
    cy.contains('Create your first savings goal to start tracking').should('be.visible');

  });

  it('should show progress bar for partial completion', () => {

    cy.get('input[type="text"]').type('Progress Test');
    cy.get('input[type="number"][step="0.01"]').type('2000');
    cy.get('input[type="date"]').type('2027-02-28');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains('button', 'Add Money').click();
    cy.get('input[type="number"][step="0.01"]').last().type('1000');
    cy.contains('button', 'Add').click();
    cy.wait(1000);
    
    cy.contains('50%').should('be.visible');
    cy.contains('₱1000.00 / ₱2000.00').should('be.visible');

  });

  it('should display days remaining for future goals', () => {

    cy.get('input[type="text"]').type('Future Goal');
    cy.get('input[type="number"][step="0.01"]').type('3000');
    cy.get('input[type="date"]').type('2027-12-31');
    cy.contains('button', 'Create Goal').click();
    cy.wait(1000);
    
    cy.contains(/\d+ days/).should('be.visible');

  });

});