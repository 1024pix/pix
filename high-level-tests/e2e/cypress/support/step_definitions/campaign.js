when(`je vais sur la page d'accès à une campagne`, () => {
  cy.visitMonPix(`/campagnes`);
});

when(`je vais sur la campagne {string} avec l'identifiant {string}`, (campaignCode, participantExternalId) => {
  cy.visitMonPix(`/campagnes/${campaignCode}?participantExternalId=${participantExternalId}`);
});

then(`je vois la page de {string} de la campagne`, (page) => {
  cy.url().should('include', page);
});

then(`je vois le bandeau de reprise de parcours`, () => {
  cy.get('.resume-campaign-banner__container').should('exist');
});

when(`je saisis mon prénom {string}`, (firstName) => {
  cy.get('input#firstName').type(firstName);
});

when(`je saisis mon nom {string}`, (lastName) => {
  cy.get('input#lastName').type(lastName);
});

when(`je saisis ma date de naissance {int}-{int}-{int}`, (dayOfBirth, monthOfBirth, yearOfBirth) => {
  cy.get('input#dayOfBirth').type(dayOfBirth);
  cy.get('input#monthOfBirth').type(monthOfBirth);
  cy.get('input#yearOfBirth').type(yearOfBirth);
});
