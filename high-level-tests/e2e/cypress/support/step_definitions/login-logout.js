// Given
given(`je me connecte avec le compte {string}`, (email) => {
  cy.get('input[name="login"]').type(email);
  cy.get('input[name="password"]').type('pix123');
  cy.get('button[type=submit]').click();
});

given(`je me connecte avec un mot de passe temporaire`, () => {
  cy.get('input[name="login"]').type('user.shouldChangePassword1234');
  cy.get('input[name="password"]').type('Pix12345');
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

// When
when('je vais sur Pix via un organisme externe', () => {
  cy.loginExternalPlatform();
});

when(`je vais sur l'inscription de Pix`, () => {
  cy.visitMonPix(`/inscription`);
});

when('je suis connecté avec un compte dont le token expire bientôt', () => {
  cy.loginWithAlmostExpiredToken();
});

when(`j'attends {int} ms`, (duration) => {
  cy.wait(duration);
});

// Then
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
  cy.get('.logged-user-summary__name').should((userName) => {
    expect(userName.text()).to.contains(fullName);
  });
  cy.get('.list-campaigns-page').should((list) => {
    expect(list).to.exist;
  });
});

then(`je suis redirigé vers le compte Certif de {string}`, (fullName) => {
  cy.url().should('include', '/sessions/list');
  cy.get('.topbar__user-identification').should((userName) => {
    expect(userName.text()).to.contains(fullName);
  });
});

when(`je me déconnecte`, () => {
  cy.get('.logged-user-name__link').click();
  cy.get('.logged-user-menu__link:last-of-type').click();
});

when(`je me déconnecte de Pix Orga`, () => {
  cy.get('.topbar__user-logged-menu').click();
  cy.get('.logged-user-menu-item:last-of-type').click();
});

when(`je me déconnecte de Pix Certif`, () => {
  cy.contains('Se déconnecter').click();
});

then(`je suis redirigé vers la page {string}`, (pathname) => {
  cy.url().should('include', pathname);
});

when(`j'accepte les CGU de Pix`, () => {
  cy.get('input[type=checkbox]').click();
});

when(`j'accepte les CGU de Pix Orga`, () => {
  cy.get('button').contains('J’accepte les conditions d’utilisation').click();
});
