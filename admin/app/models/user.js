import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class User extends Model {

  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() username;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') pixCertifTermsOfServiceAccepted;
  @attr('boolean') isAuthenticatedFromGAR;

  @hasMany('membership') memberships;
  @hasMany('certification-center-membership') certificationCenterMemberships;
  @hasMany('schooling-registration') schoolingRegistrations;

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
