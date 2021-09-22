import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ConnectionMethodsController extends Controller {
  @tracked isEmailEditionMode = false;
  @tracked isEmailWithValidationEditionMode = false;
  @tracked showEmailVerificationCode = false;
  @tracked newEmail = '';

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
    this.showEmailVerificationCode = false;
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
    this.newEmail = newEmail.trim().toLowerCase();
    const emailVerificationCode = this.store.createRecord('email-verification-code', {
      password,
      newEmail: newEmail.trim().toLowerCase(),
    });
    await emailVerificationCode.send();

    this.isEmailWithValidationEditionMode = false;
    this.showEmailVerificationCode = true;
  }
}
