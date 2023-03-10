const toLower = require('lodash/toLower');
const isNil = require('lodash/isNil');
const dayjs = require('dayjs');

const config = require('../../config.js');
const { LocaleFormatError, LocaleNotSupportedError } = require('../../domain/errors.js');
const { SUPPORTED_LOCALES } = require('../../domain/constants');
const AuthenticationMethod = require('./AuthenticationMethod.js');

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
    locale,
    isAnonymous,
    memberships = [],
    certificationCenterMemberships = [],
    pixScore,
    scorecards = [],
    campaignParticipations = [],
    authenticationMethods = [],
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
  } = {}) {
    if (locale) {
      try {
        locale = Intl.getCanonicalLocales(locale)[0];
      } catch (error) {
        throw new LocaleFormatError(locale);
      }

      // Pix site uses en-GB as international English locale instead of en
      // TODO remove this code after handling en as international English locale on Pix site
      if (locale === 'en-GB') {
        locale = 'en';
      }

      if (!SUPPORTED_LOCALES.includes(locale)) {
        throw new LocaleNotSupportedError(locale);
      }
    }

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
    this.locale = locale;
    this.isAnonymous = isAnonymous;
    this.pixScore = pixScore;
    this.memberships = memberships;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.scorecards = scorecards;
    this.campaignParticipations = campaignParticipations;
    this.authenticationMethods = authenticationMethods;
    this.hasBeenAnonymised = hasBeenAnonymised;
    this.hasBeenAnonymisedBy = hasBeenAnonymisedBy;
  }

  get shouldChangePassword() {
    const pixAuthenticationMethod = this.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === AuthenticationMethod.identityProviders.PIX
    );

    return pixAuthenticationMethod ? pixAuthenticationMethod.authenticationComplement.shouldChangePassword : null;
  }

  get shouldSeeDataProtectionPolicyInformationBanner() {
    const isNotOrganizationLearner = this.cgu === true;
    const parsedDate = new Date(this.lastDataProtectionPolicySeenAt);
    return dayjs(parsedDate).isBefore(dayjs(config.dataProtectionPolicy.updateDate)) && isNotOrganizationLearner;
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
