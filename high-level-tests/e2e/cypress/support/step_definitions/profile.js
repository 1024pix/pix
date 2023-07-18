const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");

When(
  `je clique sur le rond de niveau de la compétence {string}`,
  (competenceName) => {
    cy.contains(".competence-card", competenceName)
      .find(".competence-card__link")
      .click();
  }
);

Then(
  `je vois la page de détails de la compétence {string}`,
  (competenceName) => {
    cy.get(".competence-details").should("contain", competenceName);
  }
);
