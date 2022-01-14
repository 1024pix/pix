Then('je vois la liste des sessions de certification', () => {
  cy.url().should('contain', '/sessions/list');
  cy.get('.session-list-page').should('exist');
});

Then('je vois {int} session(s) de certification dans la liste', (sessionCount) => {
  cy.get('table tbody tr').should('have.length', sessionCount);
});

Then(`je vois les détails d'une session de certification`, () => {
  cy.url().should('match', /sessions\/[0-9]*/);
  cy.get('.session-details-page').should('exist');
});

Then(`je vois le formulaire de création de session de certification`, () => {
  cy.url().should('contain', '/sessions/creation');
  cy.get('.page__title').should('contain', `Création d'une session de certification`);
  cy.get('form').should('exist');
});

Then(`je vois le formulaire de modification de session de certification`, () => {
  cy.url().should('match', /sessions\/[0-9]*\/modification/);
  cy.get('.page__title').should('contain', `Modification d'une session de certification`);
  cy.get('form').should('exist');
});

Then(`je lis la valeur {string} à l'emplacement de l'adresse de la session`, (sessionAddress) => {
  cy.get('.session-details-row .session-details-content:nth-child(3) .session-details-content__text').should('contain', sessionAddress);
});

Then('je vois {int} candidat(s) dans le tableau de candidats', (candidateCount) => {
  if(candidateCount === 0) {
    cy.get('.table__empty').should('exist');
    cy.get('.table__empty').should('contain', 'En attente de candidats');
  } else {
    cy.get('table tbody tr').should('have.length', candidateCount);
  }
});

Then('je vois le formulaire de finalisation de session de certification', () => {
  cy.url().should('match', /sessions\/[0-9]*\/finalisation/);
  cy.get('.session-finalization-step-container').should('have.length', 3);
});

Then('je vois {int} candidat(s) à finaliser', (candidateCount) => {
  cy.get('.session-finalization-reports-information-step table tbody tr').should('have.length', candidateCount);
});

Then('je vois le bouton de finalisation désactivé', () => {
  cy.get('.session-details-container div:nth-child(3) div:nth-child(2)').should('have.class', 'button--disabled');
});

When('je remplis le formulaire de création de session de certification', () => {
  cy.get('#session-address').type('2 rue du Pix Zen');
  cy.get('#session-room').type('Salle suspendue');
  cy.get('.flatpickr-day.today').click({ force: true });
  cy.get('#session-time').click();
  cy.get('#session-examiner').type('John Travolta');
  cy.get('#session-description').type('Session créée par Cypress tout seul comme un grand !');
});

When(`je clique sur le bouton de retour de la page de détails d'une session`, () => {
  cy.get('.session-details-content__return-button').click();
});

When('je clique sur la session de certification dont la salle est {string}', (roomLabel) => {
  cy.contains(roomLabel).click();
});

When(`je modifie l\'adresse de la session de certification avec la valeur {string}`, (newAddress) => {
  cy.get('#session-address').type(newAddress);
});

When(`je clique sur l'onglet des Candidats de la session de certification`, () => {
  cy.get('nav a:nth-child(2)').click();
});

When('je retire un candidat de la liste', () => {
  cy.get('.certification-candidates-actions__delete button').click();
});

When(`j'oublie de cocher une case d'Écran de fin de test vu`, () => {
  cy.get('.session-finalization-reports-information-step table tbody tr').each(function ($element, index, collection) {
    const checkBox = $element.find('td:nth-child(5) button');
    if(index !== collection.length - 1 && checkBox.hasClass('checkbox--unchecked')) {
      cy.wrap(checkBox).click();
    } else if(index === collection.length - 1 && checkBox.hasClass('checkbox--checked')) {
      cy.wrap(checkBox).click();
    }
  });
});

When(`je coche toutes les cases d'Écran de fin de test vu`, () => {
  cy.get('.session-finalization-reports-information-step table tbody tr').each(function ($element) {
    const checkBox = $element.find('td:nth-child(5) button');
    if(checkBox.hasClass('checkbox--unchecked')) {
      cy.wrap(checkBox).click();
    }
  });
});

When(`je clique sur le bouton pour finaliser la session`, () => {
  cy.get('.finalize__button').click();
});

When('je vois une modale qui me signale {int} oubli(s) de case Écran de fin test', (endTestForgottenCount) => {
  cy.get('.pix-modal__container').should('exist');
  if(endTestForgottenCount === 0) {
    cy.get('div.app-modal-body__warning p').should('have.length', 1);
  } else {
    cy.get('div.app-modal-body__warning p').should('have.length', 2);
    cy.get('.app-modal-body__contextual').contains(`La case "Écran de fin du test vu" n'est pas cochée pour ${endTestForgottenCount} candidat(s)`);
  }
});
