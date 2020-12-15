when(`je veux gérer le compte d'un élève`, () => {
  cy.get('[aria-label="Afficher les actions"]').click();
  cy.contains('Gérer le compte').click();
});

when('je sélectionne la méthode de connexion {string}', (value) => {
  cy.get('#select-connexionType').select(value);
});

then(`je vois la modale de gestion du compte de l'élève`, () => {
  cy.contains('Gestion du compte Pix de l\'élève');
});

then('je vois l\'identifiant généré', () => {
  cy.contains('Identifiant');
});

then('je vois le mot de passe généré', () => {
  cy.contains('Nouveau mot de passe à usage unique');
});

then('je vois {int} élève\(s\)', (studentsCount) => {
  cy.get('[aria-label="Élève"]').should('have.lengthOf', studentsCount);
});

then('je vois {int} étudiant\(s\)', (studentsCount) => {
  cy.get('[aria-label="Étudiant"]').should('have.lengthOf', studentsCount);
});
