describe("a11y", () => {
  beforeEach(() => {
    cy.task("db:fixture", "users");
    cy.task("db:fixture", "authentication-methods");
    cy.task("db:fixture", "organizations");
    cy.task("db:fixture", "memberships");
    cy.task("db:fixture", "organization-invitations");
    cy.task("db:fixture", "user-orga-settings");
    cy.task("db:fixture", "target-profiles");
    cy.task("db:fixture", "target-profile_tubes");
    cy.task("db:fixture", "campaigns");
    cy.task("db:fixture", "campaign_skills");
    cy.task("db:fixture", "organization-learners");
    cy.task("db:fixture", "campaign-participations");
    cy.task("db:fixture", "assessments");
    cy.task("db:fixture", "answers");
    cy.task("db:fixture", "knowledge-elements");
  });

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
      { url: "/modules/bien-ecrire-son-adresse-mail" },
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
