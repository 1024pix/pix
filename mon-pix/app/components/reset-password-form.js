import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import isPasswordValid from '../utils/password-validator';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

const WRONG_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';
const FORBIDDEN_ERROR_MESSAGE = 'Vous n’êtes pas autorisé à faire cette demande.';
const EXPIRED_DEMAND_ERROR_MESSAGE = 'Nous sommes désolés, mais votre demande de réinitialisation de mot de passe a déjà été utilisée ou est expirée. Merci de recommencer.';
const UNEXPECTED_ERROR = 'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';

export default class ResetPasswordForm extends Component {
  @service url;

  @tracked hasSucceeded = false;
  validation = {
    @tracked status: 'default',
    @tracked message: null,
  };

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  validatePassword() {
    const password = this.args.user.password;
    if (isPasswordValid((password))) {
      this._resetValidation();
    } else {
      this.validation.status = 'error';
      this.validation.message = WRONG_FORMAT_ERROR_MESSAGE;
    }
  }

  @action
  async handleResetPassword(event) {
    event && event.preventDefault();

    this.hasSucceeded = false;
    try {
      await this.args.user.save({ adapterOptions: { updatePassword: true, temporaryKey: this.args.temporaryKey } });
      this._resetValidation();
      this.hasSucceeded = true;
      this.args.user.password = null;
    } catch (response) {
      const status = get(response, 'errors[0].status');
      this.validation.status = 'error';
      switch (status) {
        case '400':
          this.validation.message = WRONG_FORMAT_ERROR_MESSAGE;
          break;
        case '403':
          this.validation.message = FORBIDDEN_ERROR_MESSAGE;
          break;
        case '404':
          this.validation.message = EXPIRED_DEMAND_ERROR_MESSAGE;
          break;
        case '500':
          this.validation.message = UNEXPECTED_ERROR;
          break;
        default:
          this.validation.message = UNEXPECTED_ERROR;
          break;
      }
    }
  }

  _resetValidation() {
    this.validation.status = 'default';
    this.validation.message = null;
  }
}
