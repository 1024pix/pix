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
  @attr('boolean') hasAssessmentParticipations;
  @attr('boolean') hasRecommendedTrainings;
  @attr('string') codeForLastProfileToShare;
  @attr('string') lang;
  @attr('boolean') isAnonymous;
  @attr('boolean') shouldSeeDataProtectionPolicyInformationBanner;
  @attr() lastDataProtectionPolicySeenAt;

  // includes
  @belongsTo('is-certifiable') isCertifiable;
  @belongsTo('profile') profile;
  @hasMany('certification') certifications;
  @hasMany('scorecard') scorecards;
  @hasMany('trainings') trainings;

  // methods
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
