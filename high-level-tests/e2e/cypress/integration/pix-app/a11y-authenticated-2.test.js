describe("a11y", () => {
  const viewports = [
    { width: 350, height: 667 },
    { width: 1280, height: 800 },
  ];

  const fixtures = [
    "users",
    "authentication-methods",
    "organizations",
    "memberships",
    "organization-invitations",
    "user-orga-settings",
    "target-profiles",
    "target-profile_tubes",
    "campaigns",
    "campaign_skills",
    "organization-learners",
    "campaign-participations",
    "assessments",
    "answers",
    "knowledge-elements",
  ];

  const loadFixtures = () => {
    fixtures.forEach((fixture) => cy.task("db:fixture", fixture));
  };

  beforeEach(loadFixtures);
  describe("Authenticated pages", () => {
    const authenticatedPages = [
      { url: "/mes-tutos/enregistres" },
      { url: "/mes-tutos/recommandes" },
      { url: "/mon-compte/informations-personnelles" },
      { url: "/mon-compte/langue" },
      { url: "/mon-compte/methodes-de-connexion" },
      { url: "/plan-du-site" },
    ];

    authenticatedPages.forEach(({ url, skipFailures = false }) => {
      beforeEach(() => {
        // given
        cy.visitMonPix("/");
        cy.login("john.snow@pix.fr", "pix123");
      });

      it(`${url} should be accessible`, () => {
        // when
        cy.visitMonPix(url);
        cy.get(".app-loader").should("not.exist");

        cy.injectAxe();

        // then
        viewports.forEach(({ width, height }) => {
          cy.viewport(width, height);
          cy.checkA11yAndShowViolations({ skipFailures, url });
        });
      });
    });
  });
});
