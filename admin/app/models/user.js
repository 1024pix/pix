/* eslint-disable ember/no-computed-properties-in-native-classes */

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

  @hasMany('membership') memberships;
  @hasMany('certification-center-membership') certificationCenterMemberships;
  @hasMany('schooling-registration') schoolingRegistrations;
  @hasMany('authentication-method') authenticationMethods;

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasEmailAuthenticationMethod() {
    return this.email && this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX');
  }

  get hasUsernameAuthenticationMethod() {
    return this.username && this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX');
  }

  get hasPoleEmploiAuthenticationMethod() {
    return this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'POLE_EMPLOI');
  }

  get hasGARAuthenticationMethod() {
    return this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'GAR');
  }
}
