Given('les données de test sont chargées', () => {
  cy.task('db:fixture', 'users');
  cy.task('db:fixture', 'authentication-methods');
  cy.task('db:fixture', 'organizations');
  cy.task('db:fixture', 'memberships');
  cy.task('db:fixture', 'organization-invitations');
  cy.task('db:fixture', 'user-orga-settings');
  cy.task('db:fixture', 'target-profiles');
  cy.task('db:fixture', 'target-profiles_skills');
  cy.task('db:fixture', 'campaigns');
  cy.task('db:fixture', 'organization-learners');
  cy.task('db:fixture', 'campaign-participations');
  cy.task('db:fixture', 'assessments');
  cy.task('db:fixture', 'answers');
  cy.task('db:fixture', 'knowledge-elements');
  cy.task('db:fixture', 'pix-admin-roles');
  cy.task('db:fixture', 'trainings');
  cy.task('db:fixture', 'target-profile-trainings');
});

Given('tous les comptes sont créés', () => {
  cy.task('db:fixture', 'users');
  cy.task('db:fixture', 'authentication-methods');
});

Given('je vais sur Pix', () => {
  cy.visitMonPix('/');
});

Given('je vais sur Pix Orga', () => {
  cy.visitOrga('/');
});

Given('je vais sur la page {string}', (pathname) => {
  cy.visitMonPix(pathname);
});

Given('je suis connecté à Pix en tant que {string}', (user) => {
  switch (user) {
    case 'John Snow':
      cy.login('john.snow@pix.fr', 'pix123');
      break;
    case 'Jaime Lannister':
      cy.login('jaime.lannister@example.net', 'pix123');
      break;
    default:
      cy.login('daenerys.targaryen@pix.fr', 'pix123');
      break;
  }
});

Given('je suis connecté à Pix Orga', () => {
  cy.loginOrga('daenerys.targaryen@pix.fr', 'pix123');
});

Given("je suis connecté à Pix en tant qu'administrateur", () => {
  cy.loginAdmin('samwell.tarly@pix.fr', 'pix123');
});

When(`je clique sur {string}`, (label) => {
  cy.contains(label).click();
});

When('je reviens en arrière', () => {
  cy.go('back');
});

When(`je saisis {string} dans le champ {string}`, (value, label) => {
  cy.contains(label).type(value);
});

When(`je saisis le code {string}`, (value) => {
  cy.get('input[id="campaign-code"]').type(value);
});

When(`je sélectionne {string} dans le champ {string}`, (value, label) => {
  cy.contains(label)
    .parent()
    .within(() => cy.get('select').select(value));
});

Then(`la page {string} est correctement affichée`, (pageName) => {
  cy.compareSnapshot(pageName);
});

Then(`je vois {string} comme {string}`, (value, label) => {
  cy.contains(label)
    .parent()
    .within(() => cy.contains(value));
});
