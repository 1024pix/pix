when(`je lance le course {string}`, (courseId) => {
  cy.visitMonPix(`/courses/${courseId}`);
});

when(`je lance la preview du challenge {string}`, (challengeId) => {
  cy.visitMonPix(`/challenges/${challengeId}/preview`);
});

then(`je suis redirigé vers une page d'épreuve`, () => {
  cy.get('.assessment-challenge').should('exist');
});

then(`le titre sur l'épreuve est {string}`, (titre) => {
  cy.get('.assessment-banner__title').should('contain', titre);
});

when(`l'épreuve contient le texte {string}`, (texte) => {
  cy.get('.challenge-statement__instruction').should('contain', texte);
});

then(`je choisis la réponse {string}`, (number) => {
  cy.get('#'+number).click();
});

then(`je vois la page de résultats`, () => {
  cy.get('.assessment-results').should('exist');
});

then(`j'ai passé à {string}`, (challenge) => {
  cy.contains('.result-item', challenge).find('.result-item__icon svg')
    .should('have.class', 'fa-times-circle').and('have.class', 'result-item__icon--grey');
});

then(`j'ai mal répondu à {string}`, (challenge) => {
  cy.contains('.result-item', challenge).find('.result-item__icon svg')
    .should('have.class', 'fa-times-circle').and('have.class', 'result-item__icon--red');
});


then(`j'ai bien répondu à {string}`, (challenge) => {
  cy.contains('.result-item', challenge).find('.result-item__icon svg')
    .should('have.class', 'fa-check-circle').and('have.class', 'result-item__icon--green');
});
