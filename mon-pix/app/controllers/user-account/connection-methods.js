import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ConnectionMethodsController extends Controller {

  @service currentUser;
  @tracked isEmailEditionMode = false;
  @tracked isEmailWithValidationEditionMode = false;

  @action
  enableEmailEditionMode() {
    this.isEmailEditionMode = true;
  }

  @action
  enableEmailWithValidationEditionMode() {
    this.isEmailWithValidationEditionMode = true;
  }

  @action
  disableEmailEditionMode() {
    this.isEmailEditionMode = false;
  }

  @action
  disableEmailWithValidationEditionMode() {
    this.isEmailWithValidationEditionMode = false;
  }

  @action
  async saveNewEmail(newEmail, password) {
    this.model.email = newEmail.trim().toLowerCase();
    this.model.password = password;
    await this.model.save({ adapterOptions: { updateEmail: true } });
    this.model.password = null;
    this.disableEmailEditionMode();
  }

  @action
  async sendVerificationCode({ newEmail, password }) {
    const emailVerificationCode = this.store.createRecord('email-verification-code');
    await emailVerificationCode.save({ adapterOptions: {
      password,
      newEmail: newEmail.trim().toLowerCase(),
      userId: this.currentUser.user.id,
    } });
  }
}
