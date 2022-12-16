When('je vais sur la page de connexion', () => {
  cy.visitMonPix('/connexion');
});

When(`je vais sur la compétence {string}`, (competenceId) => {
  cy.visitMonPix(`/competences/${competenceId}/details`);
});

Then(`je vois le titre de la page {string}`, (pageTitle) => {
  cy.title().should('equal', pageTitle);
});
