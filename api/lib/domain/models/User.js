const _ = require('lodash');
const AuthenticationMethod = require('./AuthenticationMethod');

class User {
  constructor({
    id,
    cgu,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    email,
    emailConfirmedAt,
    username,
    firstName,
    knowledgeElements,
    lastName,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    hasSeenAssessmentInstructions,
    hasSeenNewDashboardInfo,
    hasSeenFocusedChallengeTooltip,
    hasSeenOtherChallengesTooltip,
    mustValidateTermsOfService,
    lang,
    isAnonymous,
    memberships = [],
    certificationCenterMemberships = [],
    pixRoles = [],
    pixScore,
    scorecards = [],
    campaignParticipations = [],
    authenticationMethods = [],
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email ? _.toLower(email) : undefined;
    this.emailConfirmedAt = emailConfirmedAt;
    this.cgu = cgu;
    this.lastTermsOfServiceValidatedAt = lastTermsOfServiceValidatedAt;
    this.lastPixOrgaTermsOfServiceValidatedAt = lastPixOrgaTermsOfServiceValidatedAt;
    this.lastPixCertifTermsOfServiceValidatedAt = lastPixCertifTermsOfServiceValidatedAt;
    this.mustValidateTermsOfService = mustValidateTermsOfService;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.hasSeenAssessmentInstructions = hasSeenAssessmentInstructions;
    this.hasSeenOtherChallengesTooltip = hasSeenOtherChallengesTooltip;
    this.hasSeenNewDashboardInfo = hasSeenNewDashboardInfo;
    this.hasSeenFocusedChallengeTooltip = hasSeenFocusedChallengeTooltip;
    this.knowledgeElements = knowledgeElements;
    this.lang = lang;
    this.isAnonymous = isAnonymous;
    this.pixRoles = pixRoles;
    this.pixScore = pixScore;
    this.memberships = memberships;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.scorecards = scorecards;
    this.campaignParticipations = campaignParticipations;
    this.authenticationMethods = authenticationMethods;
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find((pixRole) => pixRole.name === 'PIX_MASTER');
  }

  get shouldChangePassword() {
    const pixAuthenticationMethod = this.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === AuthenticationMethod.identityProviders.PIX
    );

    return pixAuthenticationMethod ? pixAuthenticationMethod.authenticationComplement.shouldChangePassword : null;
  }

  isLinkedToOrganizations() {
    return this.memberships.length > 0;
  }

  isLinkedToCertificationCenters() {
    return this.certificationCenterMemberships.length > 0;
  }

  hasAccessToOrganization(organizationId) {
    return this.memberships.some((membership) => membership.organization.id === organizationId);
  }

  hasAccessToCertificationCenter(certificationCenterId) {
    return this.certificationCenterMemberships.some(
      (certificationCenterMembership) =>
        certificationCenterMembership.certificationCenter.id === certificationCenterId &&
        _.isNil(certificationCenterMembership.disabledAt)
    );
  }
}

module.exports = User;
