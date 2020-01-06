when('je vais sur la page de connexion', () => {
  cy.visitMonPix('/connexion');
});

when(`je vais sur la compétence {string}`, (competenceId) => {
  cy.visitMonPix(`/competences/${competenceId}/details`);
});

then(`je vois le titre de la page {string}`, (pageTitle) => {
  cy.title().should('equal', pageTitle);
});
