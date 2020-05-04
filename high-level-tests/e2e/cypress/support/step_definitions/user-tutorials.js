when(`je clique sur {string} pour le tutoriel {string}`, (buttonName, tutorialName) => {
  cy.contains('.tutorial__content', tutorialName).contains(buttonName).click();
});

when(`le titre du bouton du tutoriel {string} est {string}`, (tutorialName, buttonTitle) => {
  cy.contains('.tutorial__content', tutorialName).find('.tutorial-content-actions__save')
    .should('contain', buttonTitle);
});

then(`je vois le tutoriel {string}`, (tutorialName) => {
  cy.contains('.tutorial__content', tutorialName);
});


then('la page mes-tutos est vide', () => {
  cy.get('.user-tutorials-no-tutorial-instructions__title')
    .should('contain', 'Vous n\'avez encore rien enregistré');
});
