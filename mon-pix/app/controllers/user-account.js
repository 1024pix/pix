import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UserAccountController extends Controller {

  @tracked isEmailEditionMode = false;

  @action
  enableEmailEditionMode() {
    this.isEmailEditionMode = true;
  }

  @action
  disableEmailEditionMode() {
    this.isEmailEditionMode = false;
  }

  @action
  async saveNewEmail(newEmail) {
    this.model.email = newEmail.trim().toLowerCase();
    await this.model.save({ adapterOptions: { updateEmail: true } });
    this.disableEmailEditionMode();
  }
}
