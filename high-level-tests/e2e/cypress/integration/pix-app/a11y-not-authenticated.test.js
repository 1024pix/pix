describe("a11y", () => {
  beforeEach(() => {
    cy.task("db:fixture", "users");
    cy.task("db:fixture", "authentication-methods");
    cy.task("db:fixture", "administration_teams");
    cy.task('db:fixture', "organization_learner_types");
    cy.task("db:fixture", "organizations");
    cy.task("db:fixture", "memberships");
    cy.task("db:fixture", "organization-invitations");
    cy.task("db:fixture", "user-orga-settings");
    cy.task("db:fixture", "target-profiles");
    cy.task("db:fixture", "target-profile-shares");
    cy.task("db:fixture", "target-profile_tubes");
    cy.task("db:fixture", "campaigns");
    cy.task("db:fixture", "campaign_skills");
    cy.task("db:fixture", "organization-learners");
    cy.task("db:fixture", "campaign-participations");
    cy.task("db:fixture", "assessments");
    cy.task("db:fixture", "answers");
    cy.task("db:fixture", "knowledge-states");
    cy.task("db:fixture", "legal-document-versions");
    cy.task("db:fixture", "legal-document-version-user-acceptances");
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
      { url: "/modules/6a68bf32/bac-a-sable/details" },
      { url: "/modules/6a68bf32/bac-a-sable/passage" },
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
