When(`je vais sur la page d'accès à une campagne`, () => {
  cy.visitMonPix(`/campagnes`);
});

When(`je vais sur la campagne {string} avec l'identifiant {string}`, (campaignCode, participantExternalId) => {
  cy.visitMonPix(`/campagnes/${campaignCode}?participantExternalId=${participantExternalId}`);
});

When(`j'ouvre le sujet {string}`, (tubeName) => {
  cy.contains(tubeName).closest('[aria-label="Sujet"]').within(() => {
    cy.get('button').click();
  });
});

Then(`je vois la page \(d'\)/\(de \){string} de la campagne`, (page) => {
  cy.url().should('include', page);
});

When(`je saisis la date de naissance {int}-{int}-{int}`, (dayOfBirth, monthOfBirth, yearOfBirth) => {
  cy.get('input#dayOfBirth').type(dayOfBirth);
  cy.get('input#monthOfBirth').type(monthOfBirth);
  cy.get('input#yearOfBirth').type(yearOfBirth);
});

Then(`je vois {int} campagne\(s\)`, (campaignsCount) => {
  cy.get('[aria-label="Campagne"]').should('have.lengthOf', campaignsCount);
});

Then(`je vois {int} tutoriel\(s\)`, (tutorialsCount) => {
  cy.get('[aria-label="Tutoriel"]').should('have.lengthOf', tutorialsCount);
});

When(`je recherche une campagne avec le nom {string}`, (campaignSearchName) => {
  cy.get('input#name').type(campaignSearchName);
});

Then(`je vois le détail de la campagne {string}`, (campaignName) => {
  cy.get('[aria-label="Nom de la campagne"]').contains(campaignName);
});

Then(`je vois {int} participants`, (numberOfParticipants) => {
  cy.get('[aria-label="Participant"]').should('have.lengthOf', numberOfParticipants);
});

Then(`je vois {int} profils`, (numberOfProfiles) => {
  cy.get('[aria-label="Profil"]').should('have.lengthOf', numberOfProfiles);
});

When(`je vois {int} résultats par compétence`, (numberOfResultsByCompetence) => {
  if(numberOfResultsByCompetence === 0) {
    cy.get('.table__empty').should('contain', 'En attente de résultat');
  } else {
    cy.get('[aria-label="Compétence"]').should('have.lengthOf', numberOfResultsByCompetence);
  }
});

When(`je vois {int} résultats pour la compétence`, (numberOfResultsByCompetence) => {
  cy.get('[aria-label="Votre résultat pour la compétence"]').should('have.lengthOf', numberOfResultsByCompetence);
});

When(`je vois la formation recommandée ayant le titre {string}`, (trainingName) => {
  cy.get('.training-card-content__title').should('contain', trainingName);
});

Then(`je vois la moyenne des résultats à {int}%`, (averageResult) => {
  cy.contains('Résultat moyen').parents().within(() => cy.contains(`${averageResult} %`));
});

Then(`je vois un résultat global à {int}%`, (globalResult) => {
  cy.get('[aria-label="Résultat global"]').invoke('text').then((text) => {
    //TODO: update cypress to handle insecable space https://glebbahmutov.com/cypress-examples/6.5.0/recipes/non-breaking-space.html#via-cy-contains
    expect(text.replace(/\u00a0/g, ' ')).contains(`${globalResult} %`);
  });
});

Then(`je vois que j'ai partagé mon profil`, () => {
  cy.contains('Merci, votre profil a bien été envoyé !');
});

Then(`je vois que j'ai envoyé les résultats`, () => {
  cy.contains('Merci, vos résultats ont bien été envoyés !');
});

Then(`je vois {int} sujets`, (tubeCount) => {
  cy.get('[aria-label="Sujet"]').should('have.lengthOf', tubeCount);
});

Then(`je vois que le sujet {string} est {string}`, (tubeName, recommendationLevel) => {
  cy.contains(tubeName).closest('[aria-label="Sujet"]').get(`[aria-label="${recommendationLevel}"]`);
});

When('je clique sur le bouton "Associer"', () => {
  cy.contains('button', 'Associer').click();
});
