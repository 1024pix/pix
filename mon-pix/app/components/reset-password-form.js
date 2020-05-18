import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import isPasswordValid from '../utils/password-validator';

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

@classic
export default class ResetPasswordForm extends Component {
  @service url;

  _displaySuccessMessage = null;
  validation = VALIDATION_MAP['default'];

  get urlHome() {
    return this.url.homeUrl;
  }

  @action
  validatePassword() {
    const password = this.user.password;
    const validationStatus = (isPasswordValid(password)) ? 'default' : 'error';
    this.set('validation', VALIDATION_MAP[validationStatus]);
  }

  @action
  handleResetPassword() {
    this.set('_displaySuccessMessage', false);
    return this.user.save({ adapterOptions: { updatePassword: true, temporaryKey: this.temporaryKey } })
      .then(() => {
        this.set('validation', SUBMISSION_MAP['default']);
        this.set('_displaySuccessMessage', true);
        this.set('user.password', null);
      })
      .catch(() => this.set('validation', SUBMISSION_MAP['error']));
  }
}
