given('les données de test sont chargées', () => {
  cy.task('db:fixture', 'users');
  cy.task('db:fixture', 'organizations');
  cy.task('db:fixture', 'memberships');
  cy.task('db:fixture', 'organization-invitations');
  cy.task('db:fixture', 'user-orga-settings');
  cy.task('db:fixture', 'target-profiles');
  cy.task('db:fixture', 'target-profiles_skills');
  cy.task('db:fixture', 'campaigns');
  cy.task('db:fixture', 'campaign-participations');
  cy.task('db:fixture', 'assessments');
  cy.task('db:fixture', 'answers');
  cy.task('db:fixture', 'knowledge-elements');
  cy.task('db:fixture', 'users_pix_roles');
  cy.task('db:fixture', 'students');
});

given('tous les comptes sont créés', () => {
  cy.task('db:fixture', 'users');
});

given('je vais sur Pix', () => {
  cy.visitMonPix('/');
});

given('je vais sur Pix Orga', () => {
  cy.visitOrga('/');
});

given('j\'accède à mon profil', () => {
  cy.visitMonPix('/profil');
});

given('je vais sur la page {string}', (pathname) => {
  cy.visitMonPix(pathname);
});

given('je suis connecté à Pix en tant que {string}', (user) => {
  if (user === 'John Snow') {
    cy.login('john.snow@pix.fr', 'pix123');
  } else {
    cy.login('daenerys.targaryen@pix.fr', 'pix123');
  }
});

given('je suis connecté à Pix Orga', () => {
  cy.login('daenerys.targaryen@pix.fr', 'pix123');
});

given('je suis connecté à Pix en tant qu\'administrateur', () => {
  cy.loginAdmin('samwell.tarly@pix.fr', 'pix123');
});

when(`je clique sur {string}`, (label) => {
  cy.contains(label).click();
});

when('je reviens en arrière', () => {
  cy.go('back');
});

when(`je saisis {string} dans le champ {string}`, (value, label) => {
  cy.contains(label).parent().within(() => cy.get('input').type(value));
});

when(`je sélectionne {string} dans le champ {string}`, (value, label) => {
  cy.contains(label).parent().within(() => cy.get('select').select(value));
});
