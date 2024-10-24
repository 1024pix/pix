describe("a11y", () => {
  const viewports = [
    { width: 350, height: 667 },
    { width: 1280, height: 800 },
  ];

  const authenticatedPages = [
    "/mes-tutos/enregistres",
    "/mes-tutos/recommandes",
    "/mon-compte/informations-personnelles",
    "/mon-compte/langue",
    "/mon-compte/methodes-de-connexion",
    "/plan-du-site",
    "/accueil",
    "/campagnes",
    "/campagnes/NERA/evaluation/resultats",
    "/certifications",
    "/competences",
    "/competences/recH9MjIzN54zXlwr/details",
    "/mes-certifications",
    "/mes-formations",
    "/mes-parcours",
  ];

  const loadFixtures = () => {
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

    fixtures.forEach((fixture) => cy.task("db:fixture", fixture));
  };

  beforeEach(loadFixtures);

  describe("Authenticated pages", () => {
    authenticatedPages.forEach((url) => {
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

          const skipFailures =
            url === "/assessments/fake-assessment" ? true : false;

          cy.checkA11yAndShowViolations({ skipFailures, url });
        });
      });
    });
  });
});
