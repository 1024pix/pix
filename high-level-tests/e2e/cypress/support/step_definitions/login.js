given(`je me connecte avec le compte {string}`, (email) => {
  cy.get('input[type=email]').type(email);
  cy.get('input[type=password]').type('pix123');
  cy.get('button[type=submit]').click();
});

then(`je suis redirigé vers le compte de {string}`, (fullName) => {
  cy.url().should('include', '/compte');
  cy.get('.logged-user-name').should((userName) => {
    expect(userName.text()).to.contains(fullName);
  });
  cy.get('.profile-banner__title').should((title) => {
    expect(title.text()).to.contains('Bienvenue');
  });
});

then(`je suis redirigé vers le compte Orga de {string}`, (fullName) => {
  cy.url().should('include', '/campagnes/liste');
  cy.get('.topbar__user-identification').should((userName) => {
    expect(userName.text()).to.contains(fullName);
  });
  cy.get('.page-title').should((title) => {
    expect(title.text()).to.contains('Campagnes');
  });
});
