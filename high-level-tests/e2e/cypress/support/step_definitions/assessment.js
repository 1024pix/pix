const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");

When(`je lance le course {string}`, (courseId) => {
  cy.visitMonPix(`/courses/${courseId}`);
});

When(`je lance la preview du challenge {string}`, (challengeId) => {
  cy.visitMonPix(`/challenges/${challengeId}/preview`);
});

When(`je clique sur Signaler un problème avec la question`, () => {
  cy.get(".feedback-panel__open-button").click();
});

Then(`je suis redirigé vers une page d'épreuve`, () => {
  cy.get(".challenge").should("exist");
});

Then(`le titre sur l'épreuve est {string}`, (titre) => {
  cy.get(".assessment-banner__title").should("contain", titre);
});

When(`je vois l'épreuve {string}`, (texte) => {
  cy.get(".challenge-statement-instruction__text").should("contain", texte);
});

Then(`je choisis la réponse {string}`, (number) => {
  cy.get("#" + number).click();
});

Then(`je vois la page de résultats`, () => {
  cy.get(".assessment-results").should("exist");
});

Then(`j'ai passé à {string}`, (challenge) => {
  cy.contains(".result-item", challenge)
    .find(".result-item__icon svg")
    .should("have.class", "fa-circle-xmark")
    .and("have.class", "result-item__icon--grey");
});

Then(`j'ai mal répondu à {string}`, (challenge) => {
  cy.contains(".result-item", challenge)
    .find(".result-item__icon svg")
    .should("have.class", "fa-circle-xmark")
    .and("have.class", "result-item__icon--red");
});

Then(`j'ai bien répondu à {string}`, (challenge) => {
  cy.contains(".result-item", challenge)
    .find(".result-item__icon svg")
    .should("have.class", "fa-circle-check")
    .and("have.class", "result-item__icon--green");
});
