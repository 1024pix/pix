import lodash from 'lodash';

const { toLower, isNil } = lodash;

import dayjs from 'dayjs';

import { config } from '../../../../src/shared/config.js';
import * as languageService from '../../../shared/domain/services/language-service.js';
import * as localeService from '../../../shared/domain/services/locale-service.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

class User {
  constructor(
    {
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
      hasSeenLevelSevenInfo,
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
    } = {},
    dependencies = { config, localeService, languageService },
  ) {
    if (locale) {
      locale = dependencies.localeService.getCanonicalLocale(locale);
    }

    dependencies.languageService.assertLanguageAvailability(lang);

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email ? toLower(email) : undefined;
    this.emailConfirmedAt = emailConfirmedAt;
    this.emailConfirmed = !!emailConfirmedAt && dayjs(emailConfirmedAt).isValid();
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
    this.hasSeenLevelSevenInfo = hasSeenLevelSevenInfo;
    this.hasSeenFocusedChallengeTooltip = hasSeenFocusedChallengeTooltip;
    this.knowledgeElements = knowledgeElements;
    this.lang = lang ?? dependencies.languageService.LANGUAGES_CODE.FRENCH;
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
    this.dependencies = dependencies;
  }

  get shouldChangePassword() {
    const pixAuthenticationMethod = this.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    );

    return pixAuthenticationMethod ? pixAuthenticationMethod.authenticationComplement.shouldChangePassword : null;
  }

  get shouldSeeDataProtectionPolicyInformationBanner() {
    const isNotOrganizationLearner = this.cgu === true;
    const parsedDate = new Date(this.lastDataProtectionPolicySeenAt);
    return (
      dayjs(parsedDate).isBefore(dayjs(this.dependencies.config.dataProtectionPolicy.updateDate)) &&
      isNotOrganizationLearner
    );
  }

  setLocaleIfNotAlreadySet(newLocale) {
    this.hasBeenModified = false;
    if (newLocale && !this.locale) {
      const canonicalLocale = this.dependencies.localeService.getCanonicalLocale(newLocale);
      this.locale = canonicalLocale;
      this.hasBeenModified = true;
    }
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
        isNil(certificationCenterMembership.disabledAt),
    );
  }

  markEmailAsValid() {
    this.emailConfirmedAt = new Date();
  }

  mapToDatabaseDto() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      emailConfirmedAt: this.emailConfirmedAt,
      cgu: this.cgu,
      lastTermsOfServiceValidatedAt: this.lastTermsOfServiceValidatedAt,
      lastPixOrgaTermsOfServiceValidatedAt: this.lastPixOrgaTermsOfServiceValidatedAt,
      lastPixCertifTermsOfServiceValidatedAt: this.lastPixCertifTermsOfServiceValidatedAt,
      lastDataProtectionPolicySeenAt: this.lastDataProtectionPolicySeenAt,
      mustValidateTermsOfService: this.mustValidateTermsOfService,
      pixOrgaTermsOfServiceAccepted: this.pixOrgaTermsOfServiceAccepted,
      pixCertifTermsOfServiceAccepted: this.pixCertifTermsOfServiceAccepted,
      hasSeenAssessmentInstructions: this.hasSeenAssessmentInstructions,
      hasSeenOtherChallengesTooltip: this.hasSeenOtherChallengesTooltip,
      hasSeenNewDashboardInfo: this.hasSeenNewDashboardInfo,
      hasSeenLevelSevenInfo: this.hasSeenLevelSevenInfo,
      hasSeenFocusedChallengeTooltip: this.hasSeenFocusedChallengeTooltip,
      lang: this.lang,
      locale: this.locale,
      isAnonymous: this.isAnonymous,
      hasBeenAnonymised: this.hasBeenAnonymised,
      hasBeenAnonymisedBy: this.hasBeenAnonymisedBy,
    };
  }
}

export { User };
