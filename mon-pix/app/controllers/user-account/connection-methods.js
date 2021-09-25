import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ConnectionMethodsController extends Controller {
  @service featureToggles;

  @tracked isEmailEditionMode = false;

  get shouldShowEmail() {
    return !!this.model.email;
  }

  get shouldShowUsername() {
    return !!this.model.username;
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
  async saveNewEmail(newEmail, password) {
    this.model.email = newEmail.trim().toLowerCase();
    this.model.password = password;
    await this.model.save({ adapterOptions: { updateEmail: true } });
    this.model.password = null;
    this.disableEmailEditionMode();
  }
}
