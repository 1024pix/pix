describe("Accessibility tests (a11y)", () => {
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

  describe("Not authenticated pages", () => {
    const notAuthenticatedPages = [
      { url: "/campagnes" },
      { url: "/campagnes/WALL/presentation" },
      { url: "/changer-de-mot-passe" },
      { url: "/connexion" },
      { url: "/inscription" },
      { url: "/mot-de-passe-oublie" },
      { url: "/nonconnecte" },
      { url: "/recuperer-mon-compte", skipFailures: true },
      { url: "/verification-certificat" },
      { url: "/modules/didacticiel-modulix/details" },
      { url: "/modules/didacticiel-modulix/passage" },
    ];

    notAuthenticatedPages.forEach(({ url, skipFailures = false }) => {
      it(`${url} should be accessible`, () => {
        // when
        cy.visitMonPix(url);
        cy.get(".app-loader").should("not.exist");
        cy.injectAxe();

        // then
        cy.checkA11yAndShowViolations({ skipFailures, url });
      });
    });
  });
});
