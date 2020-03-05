then('je vois le menu Équipe', () => {
  cy.get('.sidebar-menu').should('contain', 'Équipe');
});

when(`je saisis l'URL de l'invitation {int} ayant le code {string}`,(invitationId, code) => {
  const urn = `/rejoindre?invitationId=${invitationId}&code=${code}`;
  cy.visitOrga(urn);
});

then('je suis redirigé vers la page Rejoindre l\'organisation', () => {
  cy.get('.login-or-register-panel__invitation')
    .should('contain', 'Vous êtes invité(e) à rejoindre l\'organisation');
});

