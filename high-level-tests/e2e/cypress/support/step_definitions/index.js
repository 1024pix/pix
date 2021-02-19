given('les données de test sont chargées', () => {
  cy.task('db:fixture', 'users');
  cy.task('db:fixture', 'authentication-methods');
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
  cy.task('db:fixture', 'schooling-registrations');
  cy.task('db:fixture', 'certification-centers');
  cy.task('db:fixture', 'certification-center-memberships');
  cy.task('db:fixture', 'sessions');
  cy.task('db:fixture', 'certification-candidates');
  cy.task('db:fixture', 'certification-courses');
});

given('tous les comptes sont créés', () => {
  cy.task('db:fixture', 'users');
  cy.task('db:fixture', 'authentication-methods');
});

given('je vais sur Pix', () => {
  cy.visitMonPix('/');
});

given('je vais sur Pix Orga', () => {
  cy.visitOrga('/');
});

given('je vais sur Pix Certif', () => {
  cy.visitCertif('/');
});

given('je vais sur la page {string}', (pathname) => {
  cy.visitMonPix(pathname);
});

given('je suis connecté à Pix en tant que {string}', (user) => {
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

given('je suis connecté à Pix Orga', () => {
  cy.loginOrga('daenerys.targaryen@pix.fr', 'pix123');
});

given('je suis connecté à Pix Certif avec le mail {string}', (email) => {
  cy.loginCertif(email, 'pix123');
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

then(`la page {string} est correctement affichée`, (pageName) => {
  cy.compareSnapshot(pageName);
});

then(`je vois {string} comme {string}`, (value, label) => {
  cy.contains(label).parent().within(() => cy.contains(value));
});
