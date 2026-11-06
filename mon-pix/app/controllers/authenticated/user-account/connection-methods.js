import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ConnectionMethodsController extends Controller {
  @service featureToggles;
  @service oidcIdentityProviders;

  @tracked isEmailEditionMode = false;
  @tracked isPasswordEditionMode = false;
  @tracked showEmailUpdatedMessage = false;
  @tracked showPasswordUpdatedMessage = false;

  get shouldShowEmailConfirmedBanner() {
    return !!this.model.user.emailConfirmed;
  }

  get shouldShowEmail() {
    return this.shouldShowPixAuthenticationMethod && !!this.model.user.email;
  }

  get shouldShowUsername() {
    return this.shouldShowPixAuthenticationMethod && !!this.model.user.username;
  }

  get oidcAuthenticationMethodOrganizationNames() {
    return this.oidcIdentityProviders.getIdentityProviderNamesByAuthenticationMethods(this.model.authenticationMethods);
  }

  get shouldShowPixAuthenticationMethod() {
    return this.model.authenticationMethods.some(
      (authenticationMethod) => authenticationMethod.identityProvider === 'PIX',
    );
  }

  get shouldShowGarAuthenticationMethod() {
    return this.model.authenticationMethods.some(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR',
    );
  }

  get canAddEmailConnectionMethod() {
    return this.model.accountInfo.canAddEmailConnectionMethod;
  }

  get shouldShowEmailAndPasswordSection() {
    return this.shouldShowPixAuthenticationMethod || this.canAddEmailConnectionMethod;
  }

  get shouldShowOtherConnectionMethodsSection() {
    return this.shouldShowGarAuthenticationMethod || this.oidcAuthenticationMethodOrganizationNames.length > 0;
  }

  @action
  enableEmailEditionMode() {
    this.isEmailEditionMode = true;
  }

  @action
  disableEmailEditionMode() {
    this.isEmailEditionMode = false;
  }

  @action
  displayEmailUpdateMessage() {
    this.showEmailUpdatedMessage = true;
  }

  @action
  enablePasswordEditionMode() {
    this.isPasswordEditionMode = true;
  }

  @action
  disablePasswordEditionMode() {
    this.isPasswordEditionMode = false;
  }

  @action
  displayPasswordUpdatedMessage() {
    this.showPasswordUpdatedMessage = true;
  }
}
