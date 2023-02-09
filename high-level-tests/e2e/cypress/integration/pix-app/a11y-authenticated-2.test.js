describe("a11y", () => {
  const viewports = [
    { width: 350, height: 667 },
    { width: 1280, height: 800 },
  ];

  beforeEach(() => {
    cy.task("db:fixture", "users");
    cy.task("db:fixture", "authentication-methods");
    cy.task("db:fixture", "organizations");
    cy.task("db:fixture", "memberships");
    cy.task("db:fixture", "organization-invitations");
    cy.task("db:fixture", "user-orga-settings");
    cy.task("db:fixture", "target-profiles");
    cy.task("db:fixture", "target-profiles_skills");
    cy.task("db:fixture", "campaigns");
    cy.task("db:fixture", "organization-learners");
    cy.task("db:fixture", "campaign-participations");
    cy.task("db:fixture", "assessments");
    cy.task("db:fixture", "answers");
    cy.task("db:fixture", "knowledge-elements");
  });

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
