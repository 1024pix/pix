When(`je veux gérer le compte d'un élève`, () => {
  cy.get('[aria-label="Afficher les actions"]').click();
  cy.contains('Gérer le compte').click();
});

When('je sélectionne la méthode de connexion {string}', (value) => {
  cy.get('#select-connexionType').select(value);
});

Then(`je vois la modale de gestion du compte de l'élève`, () => {
  cy.contains('Gestion du compte Pix de l\'élève');
});

Then('je vois l\'identifiant généré', () => {
  cy.contains('Identifiant');
});

Then('je vois le mot de passe généré', () => {
  cy.contains('Nouveau mot de passe à usage unique');
});

Then('je vois {int} élève\(s\)', (studentsCount) => {
  cy.get('[aria-label="Élève"]').should('have.lengthOf', studentsCount);
});

Then('je vois {int} étudiant\(s\)', (studentsCount) => {
  cy.get('[aria-label="Étudiant"]').should('have.lengthOf', studentsCount);
});
