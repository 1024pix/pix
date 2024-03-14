import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import isEmailValid from '../../utils/email-validator';

const STATUSES = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error',
};

class Email {
  @tracked status = STATUSES.DEFAULT;
  @tracked message = null;
}

class Password {
  @tracked status = STATUSES.DEFAULT;
  @tracked message = null;
}

class SignupFormValidation {
  email = new Email();
  password = new Password();
}

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
  @tracked validation = new SignupFormValidation();

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

        const invitationToDelete = this.store.peekRecord(
          'certification-center-invitation',
          this.args.certificationCenterInvitationId,
        );
        invitationToDelete.unloadRecord();

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
    this.validation.password.status = STATUSES.DEFAULT;
    this.validation.password.message = null;
    this.password = event.target.value;
    const isInvalidInput = isEmpty(this.password);

    if (isInvalidInput) {
      this.validation.password.status = STATUSES.ERROR;
      this.validation.password.message = this.intl.t('common.form-errors.password.mandatory');
    } else {
      this.validation.password.status = STATUSES.SUCCESS;
    }
  }

  @action
  validateEmail(event) {
    this.validation.email.status = STATUSES.DEFAULT;
    this.validation.email.message = null;
    this.email = event.target.value?.trim();
    const isInvalidInput = !isEmailValid(this.email);

    if (isInvalidInput) {
      this.validation.email.status = STATUSES.ERROR;
      this.validation.email.message = this.intl.t('common.form-errors.email.format');
    } else {
      this.validation.email.status = STATUSES.SUCCESS;
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
