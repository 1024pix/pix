const toLower = require('lodash/toLower');
const isNil = require('lodash/isNil');
const dayjs = require('dayjs');
const config = require('../../config');

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
    lastDataProtectionPolicySeenAt,
    hasSeenAssessmentInstructions,
    hasSeenNewDashboardInfo,
    hasSeenFocusedChallengeTooltip,
    hasSeenOtherChallengesTooltip,
    mustValidateTermsOfService,
    lang,
    isAnonymous,
    memberships = [],
    certificationCenterMemberships = [],
    pixScore,
    scorecards = [],
    campaignParticipations = [],
    authenticationMethods = [],
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email ? toLower(email) : undefined;
    this.emailConfirmedAt = emailConfirmedAt;
    this.cgu = cgu;
    this.lastTermsOfServiceValidatedAt = lastTermsOfServiceValidatedAt;
    this.lastPixOrgaTermsOfServiceValidatedAt = lastPixOrgaTermsOfServiceValidatedAt;
    this.lastPixCertifTermsOfServiceValidatedAt = lastPixCertifTermsOfServiceValidatedAt;
    this.lastDataProtectionPolicySeenAt = lastDataProtectionPolicySeenAt;
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
    this.pixScore = pixScore;
    this.memberships = memberships;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.scorecards = scorecards;
    this.campaignParticipations = campaignParticipations;
    this.authenticationMethods = authenticationMethods;
  }

  get shouldChangePassword() {
    const pixAuthenticationMethod = this.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === AuthenticationMethod.identityProviders.PIX
    );

    return pixAuthenticationMethod ? pixAuthenticationMethod.authenticationComplement.shouldChangePassword : null;
  }

  get shouldSeeDataProtectionPolicyInformationBanner() {
    const formattedDate = new Date(this.lastDataProtectionPolicySeenAt);
    return dayjs(formattedDate).isBefore(dayjs(config.dataProtectionPolicy.updateDate));
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
        isNil(certificationCenterMembership.disabledAt)
    );
  }
}

module.exports = User;
