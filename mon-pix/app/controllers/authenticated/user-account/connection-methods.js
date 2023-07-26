import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ConnectionMethodsController extends Controller {
  @service featureToggles;
  @service oidcIdentityProviders;

  @tracked isEmailEditionMode = false;
  @tracked showEmailUpdatedMessage = false;

  get shouldShowEmail() {
    return !!this.model.user.email;
  }

  get shouldShowUsername() {
    return !!this.model.user.username;
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
}
