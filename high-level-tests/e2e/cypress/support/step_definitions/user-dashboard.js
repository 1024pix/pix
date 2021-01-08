when(`je vais sur mon dashboard`, () => {
  cy.visitMonPix(`/accueil`);
});

then(`je vois le résumé de mes participations aux campagnes qui ne sont pas partagées`, () => {
  cy.get('.campaign-participation-overview-grid').should('exist');
});

then(`je vois {int} participation\(s\) aux campagnes`, (campaignParticipationOverviewCount) => {
  cy.get('.campaign-participation-overview-grid__item').should('have.lengthOf', campaignParticipationOverviewCount);
});
