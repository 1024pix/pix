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

Given('je vais sur Pix Certif', () => {
  cy.visitCertif('/');
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

Given('je suis connecté à Pix Certif avec le mail {string}', (email) => {
  cy.loginCertif(email, 'pix123');
});

Given('je suis connecté à Pix en tant qu\'administrateur', () => {
  cy.loginAdmin('samwell.tarly@pix.fr', 'pix123');
});

When(`je clique sur {string}`, (label) => {
  cy.contains(label).click();
});

When('je reviens en arrière', () => {
  cy.go('back');
});

When(`je saisis {string} dans le champ {string}`, (value, label) => {
  cy.contains(label).parent().within(() => cy.get('input').type(value));
});

When(`je sélectionne {string} dans le champ {string}`, (value, label) => {
  cy.contains(label).parent().within(() => cy.get('select').select(value));
});

Then(`la page {string} est correctement affichée`, (pageName) => {
  cy.compareSnapshot(pageName);
});

Then(`je vois {string} comme {string}`, (value, label) => {
  cy.contains(label).parent().within(() => cy.contains(value));
});


Then('je vérifie l\'accessibilité', () => {
  cy.injectAxe();
  cy.checkA11y(null,   {
      rules: {
        'html-lang-valid': { enabled: false },
      },
    },
  )
});
