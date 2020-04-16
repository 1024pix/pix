when(`je saisis l'URL de l'invitation`,() => {
  const urn = `/rejoindre?invitationId=1&code=ABCDEFGHI5`;
  cy.visitOrga(urn);
});

then(`je suis redirigé vers la page pour rejoindre l'organisation`, () => {
  cy.get('.login-or-register-panel__invitation')
    .should('contain', 'Vous êtes invité(e) à rejoindre l\'organisation');
});

then(`je vois {int} invitation\(s\) en attente`, (numberOfInvitations) => {
  cy.get('[aria-label="Invitation en attente"]').should('have.lengthOf', numberOfInvitations);
});

then(`je vois {int} membre\(s\)`, (numberOfMembers) => {
  cy.get('[aria-label="Membre"]').should('have.lengthOf', numberOfMembers);
});

when(`j'invite {string} à rejoindre l'organisation`, (emailAddresses) => {
  cy.contains('Inviter un membre').click();
  cy.contains('Adresse(s) e-mail').parent().within(() => cy.get('input').type(emailAddresses));
  cy.get('button').contains('Inviter').click();
});
