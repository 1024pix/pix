When(`je lance le course {string}`, (courseId) => {
  cy.visitMonPix(`/courses/${courseId}`);
});

When(`je lance la preview du challenge {string}`, (challengeId) => {
  cy.visitMonPix(`/challenges/${challengeId}/preview`);
});

Then(`je suis redirigé vers une page d'épreuve`, () => {
  cy.get('.assessment-challenge').should('exist');
});

Then(`le titre sur l'épreuve est {string}`, (titre) => {
  cy.get('.assessment-banner__title').should('contain', titre);
});

When(`je vois l'épreuve {string}`, (texte) => {
  cy.get('.challenge-statement__instruction').should('contain', texte);
});

Then(`je choisis la réponse {string}`, (number) => {
  cy.get('#'+number).click();
});

Then(`je vois la page de résultats`, () => {
  cy.get('.assessment-results').should('exist');
});

Then(`j'ai passé à {string}`, (challenge) => {
  cy.contains('.result-item', challenge).find('.result-item__icon svg')
    .should('have.class', 'fa-times-circle').and('have.class', 'result-item__icon--grey');
});

Then(`j'ai mal répondu à {string}`, (challenge) => {
  cy.contains('.result-item', challenge).find('.result-item__icon svg')
    .should('have.class', 'fa-times-circle').and('have.class', 'result-item__icon--red');
});


Then(`j'ai bien répondu à {string}`, (challenge) => {
  cy.contains('.result-item', challenge).find('.result-item__icon svg')
    .should('have.class', 'fa-check-circle').and('have.class', 'result-item__icon--green');
});
