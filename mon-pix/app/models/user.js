import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class User extends Model {
  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('string') username;
  @attr('string') password;
  @attr('boolean') cgu;
  @attr('boolean') hasSeenAssessmentInstructions;
  @attr('boolean') hasSeenNewDashboardInfo;
  @attr('boolean') hasSeenFocusedChallengeTooltip;
  @attr('boolean') hasSeenOtherChallengesTooltip;
  @attr('boolean') hasAssessmentParticipations;
  @attr('boolean') hasRecommendedTrainings;
  @attr('string') codeForLastProfileToShare;
  @attr('string') lang;
  @attr('string') locale;
  @attr('boolean') isAnonymous;
  @attr('boolean') shouldSeeDataProtectionPolicyInformationBanner;
  @attr('boolean') emailConfirmed;
  @attr('string') pixAppTermsOfServiceStatus;
  @attr('string') pixAppTermsOfServiceDocumentPath;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() lastDataProtectionPolicySeenAt;

  // includes
  @belongsTo('is-certifiable', { async: true, inverse: null }) isCertifiable;
  @belongsTo('profile', { async: true, inverse: null }) profile;
  @belongsTo('account-info', { async: true, inverse: null }) accountInfo;
  @hasMany('certification', { async: true, inverse: 'user' }) certifications;
  @hasMany('scorecard', { async: true, inverse: null }) scorecards;
  @hasMany('training', { async: true, inverse: null }) trainings;

  // methods
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
