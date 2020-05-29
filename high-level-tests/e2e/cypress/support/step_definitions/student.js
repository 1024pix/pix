when(`je veux gérer le compte d'un élève`, () => {
  cy.get('[aria-label="Afficher les actions"]').click();
  cy.contains('Gérer le compte').click();
});

then(`je vois la modal de gestion du compte de l'élève`, () => {
  cy.contains('Gestion du compte de l\'élève');
});

then('je vois le mot de passe généré', () => {
  cy.contains('Mot de passe à usage unique');
});
