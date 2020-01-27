describe('Home Page Tests', function() {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Should have graph and status containers!', function() {
    cy.get('#graph').should('have.length', 1);
    cy.get('#status').should('have.length', 1);
  });
});
