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
  @attr('boolean') hasSeenOtherChallengesTooltip;
  @attr('boolean') hasAssessmentParticipations;
  @attr('string') codeForLastProfileToShare;
  @attr('string') lang;
  @attr('boolean') isAnonymous;

  // includes
  @belongsTo('is-certifiable') isCertifiable;
  @belongsTo('profile', { async: false }) profile;
  @hasMany('certification') certifications;
  @hasMany('scorecard') scorecards;

  // methods
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
