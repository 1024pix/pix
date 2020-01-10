when('je vais sur la page de connexion', () => {
  cy.visitMonPix('/connexion');
});

when(`je vais sur la compétence {string} avec scorecard {string}`, (competenceId, scorecardId) => {
  cy.visitMonPix(`/competences/${competenceId}/scorecard/${scorecardId}`);
});

then(`je vois le titre de la page {string}`, (pageTitle) => {
  cy.title().should('equal', pageTitle);
});
