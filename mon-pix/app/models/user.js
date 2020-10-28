/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

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
  @attr('string') recaptchaToken;

  // includes
  @belongsTo('is-certifiable') isCertifiable;
  @belongsTo('profile', { async: false }) profile;
  @hasMany('campaign-participation') campaignParticipations;
  @hasMany('certification') certifications;
  @hasMany('scorecard') scorecards;

  // methods
  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${ this.lastName}`;
  }

}
