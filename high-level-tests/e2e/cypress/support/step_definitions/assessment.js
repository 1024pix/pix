when(`je lance le course {string}`, (courseId) => {
  cy.visit(`/courses/${courseId}`);
});

then(`je suis redirigé vers une page d'épreuve`, () => {
  cy.get('.assessment-challenge').should('exist');
});

then(`le titre sur l'épreuve est {string}`, (titre) => {
  cy.get('.course-banner__name').should('contain', titre);
});
