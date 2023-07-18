const {
  Given,
  When,
  Then,
} = require("@badeball/cypress-cucumber-preprocessor");

// Given
Given(`je me connecte avec le compte {string}`, (email) => {
  cy.get('input[name="login"]').type(email);
  cy.get('input[name="password"]').type("pix123");
  cy.get("button[type=submit]").click();
});

Given(`je me connecte avec un mot de passe temporaire`, () => {
  cy.get('input[name="login"]').type("tommen.baratheon1234");
  cy.get('input[name="password"]').type("Pix12345");
  cy.get("button[type=submit]").click();
});

Given(
  `je m'inscris avec le prénom {string}, le nom {string}, le mail {string} et le mot de passe {string}`,
  (firstname, lastname, email, password) => {
    cy.get('input[id="firstName"]').type(firstname);
    cy.get('input[id="lastName"]').type(lastname);
    cy.get("input[id=email]").type(email);
    cy.get("input[id=password]").type(password);
    cy.get("input[type=checkbox]").check();
    cy.get("button[type=submit]").click();
  }
);

// When
When("je me connecte à Pix via le GAR", () => {
  cy.loginExternalPlatformForTheFirstTime();
});

When("je me connecte sur Pix pour la seconde fois via le GAR", () => {
  cy.loginExternalPlatformForTheSecondTime();
});

When(`je vais sur l'inscription de Pix`, () => {
  cy.visitMonPix(`/inscription`);
});

When("je suis connecté avec un compte dont le token expire bientôt", () => {
  cy.loginWithAlmostExpiredToken();
});

When(`j'attends {int} ms`, (duration) => {
  cy.wait(duration);
});

// Then
Then(`je suis redirigé vers la page d'accueil de {string}`, (firstName) => {
  cy.url().should("include", "/accueil");
  cy.get(".logged-user-name").should((userName) => {
    expect(userName.text()).to.contains(firstName);
  });
});

Then(`je suis redirigé vers le profil de {string}`, (firstName) => {
  cy.url().should("include", "/competences");
  cy.get(".logged-user-name").should((userName) => {
    expect(userName.text()).to.contains(firstName);
  });
  cy.get(".rounded-panel-title").should((title) => {
    expect(title.text()).to.contains("Vous avez 16 compétences à tester.");
  });
});

Then(`je suis redirigé vers le compte Orga de {string}`, (fullName) => {
  cy.url().should("include", "/campagnes");
  cy.contains(fullName).should("be.visible");
  cy.get(".list-campaigns-page").should((list) => {
    expect(list).to.exist;
  });
});

When(`je me déconnecte`, () => {
  cy.get(".logged-user-name__link").click();
  cy.get("ul.logged-user-menu__actions")
    .children()
    .children("[href*='deconnexion']")
    .click();
});

When(`je me déconnecte de Pix Orga`, () => {
  cy.get('[aria-label="Ouvrir le menu utilisateur"]').click();
  cy.contains("Se déconnecter").click();
});

Then(`je suis redirigé vers la page {string}`, (pathname) => {
  cy.url().should("include", pathname);
});

When(`j'accepte les CGU de Pix`, () => {
  cy.get("input[type=checkbox]").click();
});

When(`j'accepte les CGU de Pix Orga`, () => {
  cy.get("button").contains("J’accepte les conditions d’utilisation").click();
});
