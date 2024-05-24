const { When, Then } = require('@badeball/cypress-cucumber-preprocessor');

When(`je lance le module {string}`, (moduleId) => {
  cy.visitMonPix(`/modules/${moduleId}`);
});

Then('la page de {string} devrait s\'afficher', function(page) {
  cy.url().should('include', page);
});

When(`je vais au grain suivant`, () => {
  cy.findByRole('button', { name: /(Continuer|Passer)/ }).click();
});
