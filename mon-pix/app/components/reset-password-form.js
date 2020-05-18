import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import isPasswordValid from '../utils/password-validator';
import { tracked } from '@glimmer/tracking';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

const SUBMISSION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

export default class ResetPasswordForm extends Component {
  @service url;

  @tracked hasSucceeded = false;
  @tracked validation = VALIDATION_MAP['default'];

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  validatePassword() {
    const password = this.args.user.password;
    const validationStatus = (isPasswordValid(password)) ? 'default' : 'error';
    this.validation = VALIDATION_MAP[validationStatus];
  }

  @action
  async handleResetPassword(event) {
    event && event.preventDefault();

    this.hasSucceeded = false;
    try {
      await this.args.user.save({ adapterOptions: { updatePassword: true, temporaryKey: this.args.temporaryKey } });
      this.validation = SUBMISSION_MAP['default'];
      this.hasSucceeded = true;
      this.args.user.password = null;
    } catch (error) {
      this.validation = SUBMISSION_MAP['error'];
    }
  }
}
