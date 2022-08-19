import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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

  get shouldShowPixAuthenticationMethod() {
    return this.model.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'PIX'
    );
  }

  get shouldShowGarAuthenticationMethod() {
    return this.model.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR'
    );
  }

  get shouldShowPoleEmploiAuthenticationMethod() {
    return this.model.authenticationMethods.any(
      (authenticationMethod) =>
        authenticationMethod.identityProvider === this.oidcIdentityProviders['pole-emploi']?.code
    );
  }

  get shouldShowCnavAuthenticationMethod() {
    return this.model.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === this.oidcIdentityProviders.cnav?.code
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
