when(`je vais sur la campagne {string}`, (campaignCode) => {
  cy.visit(`/campagnes/${campaignCode}`);
});

then(`je vois la page de {string} de la campagne`, (page) => {
  cy.url().should('include', page);
});
