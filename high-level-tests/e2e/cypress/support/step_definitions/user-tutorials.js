When(`je clique sur {string} pour le tutoriel {string}`, (buttonName, tutorialName) => {
  cy.contains('.tutorial__content', tutorialName).contains(buttonName).click();
});

When(`le titre du bouton du tutoriel {string} est {string}`, (tutorialName, buttonTitle) => {
  cy.contains('.tutorial__content', tutorialName).find('.tutorial-content-actions__save')
    .should('contain', buttonTitle);
});

Then(`je vois le tutoriel {string}`, (tutorialName) => {
  cy.contains('.tutorial__content', tutorialName);
});


Then('la page mes-tutos est vide', () => {
  cy.get('.user-tutorials-no-tutorial-instructions__title')
    .should('contain', 'Vous n\'avez encore rien enregistré');
});
