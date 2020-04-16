when(`je clique sur l'engrenage`, () => {
  cy.get('table > tbody > tr:nth-child(1) > td.list-students-page__password-reset-cell > div > button').click();
});

then(`je vois la modal de gestion du compte de l'élève`, () => {
  cy.contains('Gestion du compte de l\'élève');
});

then('je vois le mot de passe généré', () => {
  cy.contains('Mot de passe à usage unique');
});
