import dayjs from 'dayjs';
import lodash from 'lodash';

import {
  coerceLanguage,
  getDefaultLocale,
  getNearestSupportedLocale,
} from '../../../shared/domain/services/locale-service.js';
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

const { toLower } = lodash;

class User {
  constructor({
    id,
    cgu,
    createdAt,
    pixCertifTermsOfServiceAccepted,
    email,
    emailConfirmedAt,
    username,
    firstName,
    knowledgeElements,
    lastName,
    lastTermsOfServiceValidatedAt,
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
    pixScore,
    scorecards = [],
    updatedAt,
    campaignParticipations = [],
    authenticationMethods = [],
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email && toLower(email);
    this.emailConfirmedAt = emailConfirmedAt;
    this.emailConfirmed = !!emailConfirmedAt && dayjs(emailConfirmedAt).isValid();
    this.cgu = cgu;
    this.createdAt = createdAt;
    this.lastTermsOfServiceValidatedAt = lastTermsOfServiceValidatedAt;
    this.lastPixCertifTermsOfServiceValidatedAt = lastPixCertifTermsOfServiceValidatedAt;
    this.lastDataProtectionPolicySeenAt = lastDataProtectionPolicySeenAt;
    this.mustValidateTermsOfService = mustValidateTermsOfService;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.hasSeenAssessmentInstructions = hasSeenAssessmentInstructions;
    this.hasSeenOtherChallengesTooltip = hasSeenOtherChallengesTooltip;
    this.hasSeenNewDashboardInfo = hasSeenNewDashboardInfo;
    this.hasSeenFocusedChallengeTooltip = hasSeenFocusedChallengeTooltip;
    this.knowledgeElements = knowledgeElements;
    this.lang = coerceLanguage(lang);
    this.locale = getNearestSupportedLocale(locale);
    this.isAnonymous = isAnonymous;
    this.pixScore = pixScore;
    this.memberships = memberships;
    this.scorecards = scorecards;
    this.updatedAt = updatedAt;
    this.campaignParticipations = campaignParticipations;
    this.authenticationMethods = authenticationMethods;
    this.hasBeenAnonymised = hasBeenAnonymised;
    this.hasBeenAnonymisedBy = hasBeenAnonymisedBy;
  }

  get isActive() {
    return this.isAnonymous || this.hasBeenAnonymised;
  }

  get shouldChangePassword() {
    const pixAuthenticationMethod = this.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    );

    return pixAuthenticationMethod ? pixAuthenticationMethod.authenticationComplement?.shouldChangePassword : null;
  }

  get passwordHash() {
    const pixAuthenticationMethod = this.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    );

    return pixAuthenticationMethod ? pixAuthenticationMethod.authenticationComplement?.password : null;
  }

  changeLocale(newLocale) {
    if (!newLocale) {
      this.locale = getDefaultLocale();
      return true;
    }
    if (!this.locale || this.locale !== newLocale) {
      this.locale = getNearestSupportedLocale(newLocale);
      return true;
    }

    return false;
  }

  isLinkedToOrganizations() {
    return this.memberships.length > 0;
  }

  hasAccessToOrganization(organizationId) {
    return this.memberships.some((membership) => membership.organization.id === organizationId);
  }

  markEmailAsValid() {
    this.emailConfirmedAt = new Date();
  }

  anonymize(anonymizedByUserId) {
    return new User({
      ...this,
      createdAt: anonymizeGeneralizeDate(this.createdAt),
      updatedAt: anonymizeGeneralizeDate(new Date()),
      firstName: '(anonymised)',
      lastName: '(anonymised)',
      email: null,
      emailConfirmedAt: null,
      username: null,
      hasBeenAnonymised: true,
      hasBeenAnonymisedBy: anonymizedByUserId,
      lastTermsOfServiceValidatedAt: null,
      lastPixCertifTermsOfServiceValidatedAt: null,
      lastDataProtectionPolicySeenAt: null,
    });
  }

  convertAnonymousToRealUser(userAttributes) {
    return new User({
      ...this,
      ...userAttributes,
      isAnonymous: false,
      lastTermsOfServiceValidatedAt: new Date(),
      mustValidateTermsOfService: false,
    });
  }

  mapToDatabaseDto() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      emailConfirmedAt: this.emailConfirmedAt,
      cgu: this.cgu,
      lastTermsOfServiceValidatedAt: this.lastTermsOfServiceValidatedAt,
      lastPixCertifTermsOfServiceValidatedAt: this.lastPixCertifTermsOfServiceValidatedAt,
      lastDataProtectionPolicySeenAt: this.lastDataProtectionPolicySeenAt,
      mustValidateTermsOfService: this.mustValidateTermsOfService,
      pixCertifTermsOfServiceAccepted: this.pixCertifTermsOfServiceAccepted,
      hasSeenAssessmentInstructions: this.hasSeenAssessmentInstructions,
      hasSeenOtherChallengesTooltip: this.hasSeenOtherChallengesTooltip,
      hasSeenNewDashboardInfo: this.hasSeenNewDashboardInfo,
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
