given(`je me connecte avec le compte {string}`, (email) => {
  cy.get('input[type=email]').type(email);
  cy.get('input[type=password]').type('pix123');
  cy.get('button[type=submit]').click();
});

when('je vais sur Pix via un organisme externe', () => {
  cy.loginToken('daenerys.targaryen@pix.fr', 'pix123');
});

then(`je suis redirigé vers le profil de {string}`, (fullName) => {
  cy.url().should('include', '/profil');
  cy.get('.logged-user-name').should((userName) => {
    expect(userName.text()).to.contains(fullName);
  });
  cy.get('.rounded-panel-title').should((title) => {
    expect(title.text()).to.contains('Vous avez 16 compétences à tester.');
  });
});
