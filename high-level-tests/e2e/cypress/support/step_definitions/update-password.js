const { Given, Then } = require("@badeball/cypress-cucumber-preprocessor");

// Given
Given(`je remplis le formulaire avec un nouveau mot de passe`, () => {
  cy.get('input[name="password"]').type("newPix12345");
  cy.get("button[type=submit]").click();
});

// Then
Then(`je suis redirigé vers la page de mise à jour de mot de passe`, () => {
  cy.url().should("include", "/mise-a-jour-mot-de-passe-expire");
});
