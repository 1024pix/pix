import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ConnectionMethodsController extends Controller {

  @tracked isEmailEditionMode = false;
  @tracked isEmailValidationEditionMode = false;

  @action
  enableEmailEditionMode() {
    this.isEmailEditionMode = true;
  }

  @action
  enableEmailValidationEditionMode() {
    this.isEmailValidationEditionMode = true;
  }

  @action
  disableEmailEditionMode() {
    this.isEmailEditionMode = false;
  }

  @action
  disableEmailValidationEditionMode() {
    this.isEmailValidationEditionMode = false;
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
