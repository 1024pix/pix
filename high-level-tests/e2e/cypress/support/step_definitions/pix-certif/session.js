then('je vois la liste des sessions de certification', () => {
  cy.url().should('contain', '/sessions/list');
  cy.get('.session-list-page').should('exist');
});

then('je vois {int} session(s) de certification dans la liste', (sessionCount) => {
  cy.get('table tbody tr').should('have.length', sessionCount);
});

then(`je vois les détails d'une session de certification`, () => {
  cy.url().should('match', /sessions\/[0-9]*/);
  cy.get('.session-details-page').should('exist');
});

then(`je vois le formulaire de création de session de certification`, () => {
  cy.url().should('contain', '/sessions/creation');
  cy.get('.page__title').should('contain', `Création d'une session de certification`);
  cy.get('form').should('exist');
});

then(`je vois le formulaire de modification de session de certification`, () => {
  cy.url().should('match', /sessions\/[0-9]*\/modification/);
  cy.get('.page__title').should('contain', `Modification d'une session de certification`);
  cy.get('form').should('exist');
});

then(`je lis la valeur {string} à l'emplacement de l'adresse de la session`, (sessionAddress) => {
  cy.get('.session-details-row div:nth-child(2)').should('contain', sessionAddress);
});

then(`je vois la page des candidats de certification`, () => {
  cy.url().should('match', /sessions\/[0-9]*\/candidats/);
});

then(`je vois un formulaire d'ajout de candidat apparaître en haut du tableau de candidats`, () => {
  cy.get('table tbody tr:nth-child(1) td:nth-child(1)').should('have.attr', 'data-test-id', 'panel-candidate__lastName__add-staging');
});

then('je vois {int} candidat(s) dans le tableau de candidats', (candidateCount) => {
  if(candidateCount === 0) {
    cy.get('.table__empty').should('exist');
    cy.get('.table__empty').should('contain', 'En attente de candidats');
  } else {
    cy.get('table tbody tr').should('have.length', candidateCount);
  }
});

when('je remplis le formulaire de création de session de certification', () => {
  cy.get('#session-address').type('2 rue du Pix Zen');
  cy.get('#session-room').type('Salle suspendue');
  cy.get('.flatpickr-day.today').click({ force: true });
  cy.get('#session-time').click();
  cy.get('#session-examiner').type('John Travolta');
  cy.get('#session-description').type('Session créée par Cypress tout seul comme un grand !');
});

when(`je clique sur le bouton de retour de la page de détails d'une session`, () => {
  cy.get('.session-details-content__return-button').click();
});

when('je clique sur la session de certification dont la salle est {string}', (roomLabel) => {
  cy.contains(roomLabel).click();
});

when(`je modifie l\'adresse de la session de certification avec la valeur {string}`, (newAddress) => {
  cy.get('#session-address').type(newAddress);
});

when(`je clique sur l'onglet des Candidats de la session de certification`, () => {
  cy.get('nav a:nth-child(2)').click();
});

when(`j'ajoute un candidat`, () => {
  cy.get('[data-test-id="panel-candidate__lastName__add-staging"] > div > input').type('Candidat');
  cy.get('[data-test-id="panel-candidate__firstName__add-staging"] > div > input').type('Jean');
  cy.get('[data-test-id="panel-candidate__birthdate__add-staging"] > div > input').type('04011990');
  cy.get('[data-test-id="panel-candidate__birthCity__add-staging"] > div > input').type('Compète-Ville');
  cy.get('[data-test-id="panel-candidate__birthProvinceCode__add-staging"] > div > input').type('75');
  cy.get('[data-test-id="panel-candidate__birthCountry__add-staging"] > div > input').type('Brésil');
  cy.get('[data-test-id="panel-candidate__email__add-staging"] > div > input').type('jean.candidat@example.net');
  cy.get('[data-test-id="panel-candidate__externalId__add-staging"] > div > input').type('ID123456AZ');
  cy.get('[data-test-id="panel-candidate__extraTimePercentage__add-staging"] > div > input').type('30');
  cy.contains('Enregistrer').click();
});

when('je retire un candidat de la liste', () => {
  cy.get('.certification-candidates-actions__delete button').click();
});
