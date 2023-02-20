import _ from 'lodash';

class UserToCreate {
  constructor({
    firstName = '',
    lastName = '',
    email = null,
    cgu = false,
    hasSeenAssessmentInstructions = false,
    username = null,
    mustValidateTermsOfService = false,
    lastTermsOfServiceValidatedAt = null,
    lang = 'fr',
    hasSeenNewDashboardInfo = false,
    isAnonymous = false,
    hasSeenFocusedChallengeTooltip = false,
    hasSeenOtherChallengesTooltip = false,
    createdAt,
    updatedAt,
  } = {}) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.cgu = cgu;
    this.hasSeenAssessmentInstructions = hasSeenAssessmentInstructions;
    this.username = username;
    this.mustValidateTermsOfService = mustValidateTermsOfService;
    this.lastTermsOfServiceValidatedAt = lastTermsOfServiceValidatedAt;
    this.lang = lang;
    this.hasSeenNewDashboardInfo = hasSeenNewDashboardInfo;
    this.isAnonymous = isAnonymous;
    this.hasSeenFocusedChallengeTooltip = hasSeenFocusedChallengeTooltip;
    this.hasSeenOtherChallengesTooltip = hasSeenOtherChallengesTooltip;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(user) {
    const now = new Date();
    return new UserToCreate({
      ...user,
      createdAt: now,
      updatedAt: now,
      email: user.email ? _(user.email).toLower().trim() : null,
    });
  }

  static createWithTermsOfServiceAccepted(user) {
    const now = new Date();
    return new UserToCreate({
      ...user,
      cgu: true,
      lastTermsOfServiceValidatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createAnonymous(user) {
    const now = new Date();
    return new UserToCreate({
      ...user,
      isAnonymous: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export default UserToCreate;
