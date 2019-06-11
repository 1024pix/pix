when(`je lance le course {string}`, (courseId) => {
  cy.visit(`/courses/${courseId}`);
});

when(`je lance la preview du challenge {string}`, (challengeId) => {
  cy.visit(`/challenges/${challengeId}/preview`);
});

then(`je suis redirigé vers une page d'épreuve`, () => {
  cy.get('.assessment-challenge').should('exist');
});

then(`le titre sur l'épreuve est {string}`, (titre) => {
  cy.get('.course-banner__name').should('contain', titre);
});

when(`l'épreuve contient le texte {string}`, (texte) => {
  cy.get('.challenge-statement__instruction').should('contain', texte);
});

then(`je choisis la réponse {string}`, (number) => {
  cy.get('#'+number).click();
});
