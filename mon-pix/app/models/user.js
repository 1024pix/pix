import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class User extends Model {
  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('string') username;
  @attr('string') password;
  @attr('boolean') cgu;
  @attr('boolean') mustValidateTermsOfService;
  @attr('boolean') hasSeenAssessmentInstructions;
  @attr('boolean') hasSeenNewDashboardInfo;
  @attr('boolean') hasSeenFocusedChallengeTooltip;
  @attr('boolean') hasSeenOtherChallengesTooltip;
  @attr('boolean') hasSeenLevelSevenInfo;
  @attr('boolean') hasAssessmentParticipations;
  @attr('boolean') hasRecommendedTrainings;
  @attr('string') codeForLastProfileToShare;
  @attr('string') lang;
  @attr('string') locale;
  @attr('boolean') isAnonymous;
  @attr('boolean') shouldSeeDataProtectionPolicyInformationBanner;
  @attr() lastDataProtectionPolicySeenAt;

  // includes
  @belongsTo('is-certifiable', { async: true, inverse: null }) isCertifiable;
  @belongsTo('profile', { async: true, inverse: null }) profile;
  @hasMany('certification', { async: true, inverse: 'user' }) certifications;
  @hasMany('scorecard', { async: true, inverse: null }) scorecards;
  @hasMany('trainings', { async: true, inverse: null }) trainings;

  // methods
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
