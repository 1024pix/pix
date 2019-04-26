when(`je vais sur la campagne {string}`, (campaignCode) => {
  cy.visitMonPix(`/campagnes/${campaignCode}`);
});

then(`je vois la page de {string} de la campagne`, (page) => {
  cy.url().should('include', page);
});

then(`je vois le bandeau de reprise de parcours`, () => {
  cy.get('.resume-campaign-banner__container').should('exist');
});
