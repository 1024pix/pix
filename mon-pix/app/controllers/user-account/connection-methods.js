import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ConnectionMethodsController extends Controller {
  @service featureToggles;

  @tracked isEmailEditionMode = false;
  @tracked showEmailUpdatedMessage = false;

  get shouldShowEmail() {
    return !!this.model.user.email;
  }

  get shouldShowUsername() {
    return !!this.model.user.username;
  }

  get shouldShowPixAuthenticationMethod() {
    return this.model.authenticationMethods.any((authenticationMethod) => authenticationMethod.isPixIdentityProvider);
  }

  get shouldShowGarAuthenticationMethod() {
    return this.model.authenticationMethods.any((authenticationMethod) => authenticationMethod.isGarIdentityProvider);
  }

  get shouldShowPoleEmploiAuthenticationMethod() {
    return this.model.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.isPoleEmploiIdentityProvider
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

  @action
  async saveNewEmail(newEmail, password) {
    this.model.user.email = newEmail.trim().toLowerCase();
    this.model.user.password = password;
    await this.model.user.save({ adapterOptions: { updateEmail: true } });
    this.model.user.password = null;
    this.disableEmailEditionMode();
  }
}
