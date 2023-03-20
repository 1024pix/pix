import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';

export default class User extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() username;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') pixCertifTermsOfServiceAccepted;
  @attr() lang;
  @attr() locale;
  @attr() createdAt;
  @attr() lastTermsOfServiceValidatedAt;
  @attr() lastPixOrgaTermsOfServiceValidatedAt;
  @attr() lastPixCertifTermsOfServiceValidatedAt;
  @attr() lastLoggedAt;
  @attr() emailConfirmedAt;
  @attr() hasBeenAnonymised;
  @attr() anonymisedByFullName;

  // includes
  @belongsTo('profile') profile;
  @belongsTo('user-login') userLogin;

  @hasMany('organization-membership') organizationMemberships;
  @hasMany('certification-center-membership') certificationCenterMemberships;
  @hasMany('organization-learner') organizationLearners;
  @hasMany('authentication-method') authenticationMethods;
  @hasMany('user-participation') participations;

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get language() {
    return this.lang?.toUpperCase();
  }
}
