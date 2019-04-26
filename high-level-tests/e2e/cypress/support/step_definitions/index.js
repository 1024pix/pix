given('les données de test sont chargées', () => {
  cy.task('db:fixture', 'users');
  cy.task('db:fixture', 'organizations');
  cy.task('db:fixture', 'organization-roles');
  cy.task('db:fixture', 'memberships');
  cy.task('db:fixture', 'target-profiles');
  cy.task('db:fixture', 'target-profiles_skills');
  cy.task('db:fixture', 'campaigns');
});

given('le compte de "Daenerys Targaryen" est créé', () => {
  cy.task('db:fixture', 'users');
});

given('je vais sur Pix', () => {
  cy.visit('/');
});

given('je vais sur Pix Orga', () => {
  cy.visit('http://localhost:4201');
});

given('j\'accède à mon profil v2', () => {
  cy.visit('/profilv2');
});

given('je suis connecté à Pix', () => {
  cy.login('daenerys.targaryen@pix.fr', 'pix123');
});

given('je suis connecté à Pix Orga', () => {
  cy.login('daenerys.targaryen@pix.fr', 'pix123');
});

when(`je clique sur {string}`, (label) => {
  cy.contains(label).click();
});
