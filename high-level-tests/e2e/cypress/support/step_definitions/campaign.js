when(`je vais sur la page d'accès à une campagne`, () => {
  cy.visitMonPix(`/campagnes`);
});

when(`je vais sur la campagne {string} avec l'identifiant {string}`, (campaignCode, participantExternalId) => {
  cy.visitMonPix(`/campagnes/${campaignCode}?participantExternalId=${participantExternalId}`);
});

then(`je vois la page \(d'\)/\(de \){string} de la campagne`, (page) => {
  cy.url().should('include', page);
});

then(`je vois le bandeau de reprise de parcours`, () => {
  cy.get('.resume-campaign-banner__container').should('exist');
});

when(`je saisis la date de naissance {int}-{int}-{int}`, (dayOfBirth, monthOfBirth, yearOfBirth) => {
  cy.get('input#dayOfBirth').type(dayOfBirth);
  cy.get('input#monthOfBirth').type(monthOfBirth);
  cy.get('input#yearOfBirth').type(yearOfBirth);
});

then(`je vois {int} campagne\(s\)`, (numberOfCampaigns) => {
  cy.get('[aria-label="Campagne"]').should('have.lengthOf', numberOfCampaigns);
});

when(`je recherche une campagne avec le nom {string}`, (campaignSearchName) => {
  cy.get('input#campaignName').type(campaignSearchName);
});

then(`je vois le détail de la campagne {string}`, (campaignName) => {
  cy.get('.page__title').should('contain', campaignName);
});

then(`je vois {int} participants`, (numberOfParticipants) => {
  cy.get('[aria-label="Participant"]').should('have.lengthOf', numberOfParticipants);
});

then(`je vois un avancement de {int}%`, (progression) => {
  cy.get('[aria-label="Avancement"]').contains(`${progression}%`);
});

when(`je vois {int} résultats par compétence`, (numberOfResultsByCompetence) => {
  cy.get('[aria-label="Résultats par compétence"]').should('have.lengthOf', numberOfResultsByCompetence);
});

then(`je vois la moyenne des résultats à {int}%`, (averageResult) => {
  cy.get('[aria-label="Moyenne des résultats"]').contains(`${averageResult}%`);
});

then(`je vois que j'ai partagé mon profil`, () => {
  cy.contains('Merci, votre profil a bien été envoyé !');
});
