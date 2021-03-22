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
  @attr('string') lang;
  @attr('boolean') isAnonymous;

  // includes
  @belongsTo('is-certifiable') isCertifiable;
  @belongsTo('profile', { async: false }) profile;
  @hasMany('campaign-participation') campaignParticipations;
  @hasMany('certification') certifications;
  @hasMany('scorecard') scorecards;

  // methods
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasAssessmentParticipations() {
    const participations = this.campaignParticipations.toArray();
    return participations.some((participation) => participation.campaign.get('isAssessment'));
  }
}
