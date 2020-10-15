when(`je vais sur la page d'accès à une campagne`, () => {
  cy.visitMonPix(`/campagnes`);
});

when(`je vais sur la campagne {string} avec l'identifiant {string}`, (campaignCode, participantExternalId) => {
  cy.visitMonPix(`/campagnes/${campaignCode}?participantExternalId=${participantExternalId}`);
});

when(`j'ouvre le sujet {string}`, (tubeName) => {
  cy.contains(tubeName).closest('[aria-label="Sujet"]').within(() => {
    cy.get('button').click();
  });
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

then(`je vois {int} campagne\(s\)`, (campaignsCount) => {
  cy.get('[aria-label="Campagne"]').should('have.lengthOf', campaignsCount);
});

then(`je vois {int} tutoriel\(s\)`, (tutorialsCount) => {
  cy.get('[aria-label="Tutoriel"]').should('have.lengthOf', tutorialsCount);
});

when(`je recherche une campagne avec le nom {string}`, (campaignSearchName) => {
  cy.get('input#name').type(campaignSearchName);
});

then(`je vois le détail de la campagne {string}`, (campaignName) => {
  cy.get('.page__title').should('contain', campaignName);
});

then(`je vois {int} participants`, (numberOfParticipants) => {
  cy.get('[aria-label="Participant"]').should('have.lengthOf', numberOfParticipants);
});

then(`je vois {int} profils`, (numberOfProfiles) => {
  cy.get('[aria-label="Profil"]').should('have.lengthOf', numberOfProfiles);
});

when(`je vois {int} résultats par compétence`, (numberOfResultsByCompetence) => {
  if(numberOfResultsByCompetence === 0) {
    cy.get('.table__empty').should('contain', 'En attente de résultat');
  } else {
    cy.get('[aria-label="Résultats par compétence"]').should('have.lengthOf', numberOfResultsByCompetence);
  }
});

when(`je vois {int} résultats pour la compétence`, (numberOfResultsByCompetence) => {
  cy.get('[aria-label="Votre résultat pour la compétence"]').should('have.lengthOf', numberOfResultsByCompetence);
});

then(`je vois la moyenne des résultats à {int}%`, (averageResult) => {
  cy.get('[aria-label="Moyenne des résultats"]').contains(`${averageResult}%`);
});

then(`je vois un résultat global à {int}%`, (globalResult) => {
  cy.get('[aria-label="Résultat global"]').contains(`${globalResult}%`);
});

then(`je vois que j'ai partagé mon profil`, () => {
  cy.contains('Merci, votre profil a bien été envoyé !');
});

then(`je vois que j'ai envoyé les résultats`, () => {
  cy.contains('Merci, vos résultats ont bien été envoyés !');
});

then(`je vois {int} sujets`, (tubeCount) => {
  cy.get('[aria-label="Sujet"]').should('have.lengthOf', tubeCount);
});

then(`je vois que le sujet {string} est {string}`, (tubeName, recommendationLevel) => {
  cy.contains(tubeName).closest('[aria-label="Sujet"]').get(`[aria-label="${recommendationLevel}"]`);
});

when(`je retourne au détail de la campagne`, () => {
  cy.get('[aria-label="Retourner au détail de la campagne"]').click();
});

when('je clique sur le bouton "Associer"', () => {
  cy.get('[aria-label="Associer"]').click();
});
