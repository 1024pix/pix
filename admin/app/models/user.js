import Model, { hasMany, attr } from '@ember-data/model';
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

  @hasMany('membership') memberships;
  @hasMany('certification-center-membership') certificationCenterMemberships;
  @hasMany('schooling-registration') schoolingRegistrations;
  @hasMany('authentication-method') authenticationMethods;

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasPixAuthenticationMethod() {
    return this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX');
  }

  get hasEmailAuthenticationMethod() {
    return (
      this.email &&
      this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX')
    );
  }

  get hasUsernameAuthenticationMethod() {
    return (
      this.username &&
      this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX')
    );
  }

  get hasPoleEmploiAuthenticationMethod() {
    return this.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'POLE_EMPLOI'
    );
  }

  get hasGarAuthenticationMethod() {
    return this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'GAR');
  }

  get hasOnlyOneAuthenticationMethod() {
    return (
      [
        this.hasEmailAuthenticationMethod,
        this.hasUsernameAuthenticationMethod,
        this.hasGarAuthenticationMethod,
        this.hasPoleEmploiAuthenticationMethod,
      ].filter((hasAuthenticationMethod) => hasAuthenticationMethod).length === 1
    );
  }

  get isAllowedToRemoveEmailAuthenticationMethod() {
    return this.hasEmailAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemoveUsernameAuthenticationMethod() {
    return this.hasUsernameAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemovePoleEmploiAuthenticationMethod() {
    return this.hasPoleEmploiAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemoveGarAuthenticationMethod() {
    return this.hasGarAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToAddEmailAuthenticationMethod() {
    return !this.hasPixAuthenticationMethod;
  }
}
