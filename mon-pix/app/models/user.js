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
  @attr('boolean') hasSeenNewLevelInfo;
  @attr('string') recaptchaToken;
  @attr('string') lang;

  // includes
  @belongsTo('is-certifiable') isCertifiable;
  @belongsTo('profile', { async: false }) profile;
  @hasMany('campaign-participation') campaignParticipations;
  @hasMany('campaign-participation-overview') campaignParticipationOverviews;
  @hasMany('certification') certifications;
  @hasMany('scorecard') scorecards;

  // methods
  get fullName() {
    return `${this.firstName} ${ this.lastName}`;
  }

}
