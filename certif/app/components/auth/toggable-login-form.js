import { action } from '@ember/object';
import isEmpty from 'lodash/isEmpty';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../../utils/email-validator';
import get from 'lodash/get';

export default class ToggableLoginForm extends Component {
  @service intl;
  @service url;
  @service store;
  @service session;

  @tracked errorMessage = null;
  @tracked isErrorMessagePresent = false;
  @tracked isLoading = false;
  @tracked password = null;
  @tracked email = null;
  @tracked passwordValidationMessage = null;
  @tracked emailValidationMessage = null;

  ERROR_MESSAGES = {
    DEFAULT: this.intl.t('common.api-error-messages.internal-server-error'),
    STATUS_400: this.intl.t('common.api-error-messages.bad-request-error'),
    STATUS_401: this.intl.t('common.api-error-messages.login-unauthorized-error'),
    STATUS_403: this.intl.t('pages.login-or-register.login-form.errors.status.403'),
    STATUS_404: this.intl.t('pages.login-or-register.login-form.errors.status.404'),
    STATUS_409: this.intl.t('pages.login-or-register.login-form.errors.status.409'),
    STATUS_412: this.intl.t('pages.login-or-register.login-form.errors.status.412'),
  };

  @action
  async authenticate(event) {
    event.preventDefault();
    this.isLoading = true;

    const email = this.email;
    const password = this.password;

    if (!this.isFormValid) {
      this.isLoading = false;
      return;
    }

    if (this.args.isWithInvitation) {
      try {
        await this.args.certificationCenterInvitation.accept({
          id: this.args.certificationCenterInvitationId,
          code: this.args.certificationCenterInvitationCode,
          email,
        });
        await this._authenticate(password, email);
      } catch (errorResponse) {
        const errorStatus = get(errorResponse, 'errors[0].status');
        const invitationIsAlreadyAcceptedOrUserIsAlreadyMember = errorStatus === '412';
        if (invitationIsAlreadyAcceptedOrUserIsAlreadyMember) {
          await this._authenticate(password, email);
          return;
        }

        this.errorMessage = this._handleResponseError(errorResponse);
        this.isErrorMessagePresent = true;
      } finally {
        this.isLoading = false;
      }
    }
  }

  async _authenticate(password, email) {
    const scope = 'pix-certif';

    try {
      await this.session.authenticate('authenticator:oauth2', email, password, scope);
    } catch (errorResponse) {
      const errors = get(errorResponse, 'responseJSON');
      this.errorMessage = this._handleResponseError(errors);
      this.isErrorMessagePresent = true;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  validatePassword(event) {
    this.password = event.target.value;
    const isInvalidInput = isEmpty(this.password);
    this.passwordValidationMessage = null;

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t('pages.login-or-register.login-form.fields.password.error');
    }
  }

  @action
  validateEmail(event) {
    this.email = event.target.value?.trim();
    const isInvalidInput = !isEmailValid(this.email);

    this.emailValidationMessage = null;

    if (isInvalidInput) {
      this.emailValidationMessage = this.intl.t('pages.login-or-register.login-form.fields.email.error');
    }
  }

  @action
  updateEmail(event) {
    this.email = event.target.value?.trim();
  }

  get isFormValid() {
    return isEmailValid(this.email) && !isEmpty(this.password);
  }

  get forgottenPasswordUrl() {
    return this.url.forgottenPasswordUrl;
  }

  _handleResponseError(errorResponse) {
    if (Array.isArray(errorResponse?.errors)) {
      const error = errorResponse?.errors[0];

      switch (error.status) {
        case '400':
          return this.ERROR_MESSAGES.STATUS_400;
        case '401':
          return this.ERROR_MESSAGES.STATUS_401;
        case '403':
          return this.ERROR_MESSAGES.STATUS_403;
        case '404':
          return this.ERROR_MESSAGES.STATUS_404;
        case '409':
          return this.ERROR_MESSAGES.STATUS_409;
        case '412':
          return this.ERROR_MESSAGES.STATUS_412;
        default:
          return this.ERROR_MESSAGES.DEFAULT;
      }
    } else {
      return this.ERROR_MESSAGES.DEFAULT;
    }
  }
}
