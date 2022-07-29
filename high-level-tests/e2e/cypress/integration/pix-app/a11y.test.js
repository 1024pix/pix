describe('a11y', () => {

  const viewports = [
    { width: 350, height: 667 },
    { width: 1280,height: 800 },
  ];

  beforeEach(() => {
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
  });

  describe('Not authenticated pages', () => {

    const notAuthenticatedPages = [
      { url: '/connexion' },
      { url: '/inscription' },
      { url: '/mot-de-passe-oublie' },
      { url: '/nonconnecte' },
      { url: '/campagnes/WALL/presentation' },
    ];

    notAuthenticatedPages.forEach(({ url , skipFailures = false }) => {
      it(`${url} should be accessible`, () => {
        // when
        cy.visitMonPix(url);
        cy.injectAxe();

        // then
        cy.checkA11yAndShowViolations({ skipFailures });
      });
    });
  });

  describe('Authenticated pages', () => {

    const authenticatedPages = [
      { url: '/accueil', skipFailures: true },
      { url: '/competences', skipFailures: true },
      { url: '/certifications', skipFailures: true },
      { url: '/mon-profil', skipFailures: true },
      { url: '/mes-tutos/recommandes',skipFailures: true },
      { url: '/mes-certifications', skipFailures: true },
    ];

    authenticatedPages.forEach(({ url, skipFailures = false }) => {
      it(`${url} should be accessible`, () => {
        // given
        cy.visitMonPix('/');
        cy.login('john.snow@pix.fr', 'pix123');

        // when
        cy.visitMonPix(url);
        cy.injectAxe();

        // then
        viewports.forEach(({ width, height}) => {
          cy.viewport(width, height);
          cy.checkA11yAndShowViolations({ skipFailures });
        })
      });
    });
  });
});
