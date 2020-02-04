given(`je me connecte avec le compte {string}`, (email) => {
  cy.get('input[name="login"]').type(email);
  cy.get('input[name="password"]').type('pix123');
  cy.get('button[type=submit]').click();
});

given(`je m'inscris avec le prénom {string}, le nom {string}, le mail {string} et le mot de passe {string}`, (firstname, lastname, email, password) => {
  cy.get('input[id="firstName"]').type(firstname);
  cy.get('input[id="lastName"]').type(lastname);
  cy.get('input[id=email]').type(email);
  cy.get('input[id=password]').type(password);
  cy.get('input[id=pix-cgu]').check();
  cy.get('button[type=submit]').click();
});

when('je vais sur Pix via un organisme externe', () => {
  cy.loginExternalPlatform();
});

when(`je vais sur l'inscription de Pix`, () => {
  cy.visitMonPix(`/inscription`);
});

then(`je suis redirigé vers le profil de {string}`, (firstName) => {
  cy.url().should('include', '/profil');
  cy.get('.logged-user-name').should((userName) => {
    expect(userName.text()).to.contains(firstName);
  });
  cy.get('.rounded-panel-title').should((title) => {
    expect(title.text()).to.contains('Vous avez 16 compétences à tester.');
  });
});

then(`je suis redirigé vers le compte Orga de {string}`, (fullName) => {
  cy.url().should('include', '/campagnes');
  cy.get('.topbar__user-identification').should((userName) => {
    expect(userName.text()).to.contains(fullName);
  });
  cy.get('.page-title').should((title) => {
    expect(title.text()).to.contains('Campagnes');
  });
});

when(`je me déconnecte`, () => {
  cy.get('.logged-user-name__link').click();
  cy.get('.logged-user-menu__link--last').click();
});

then(`je suis redirigé vers la page {string}`, (pathname) => {
  cy.url().should('include', pathname);
});
