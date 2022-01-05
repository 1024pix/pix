import { action } from '@ember/object';
import isEmpty from 'lodash/isEmpty';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmailValid from '../../utils/email-validator';

export default class LoginForm extends Component {
  @service intl;
  @service session;
  @service store;
  @service url;

  @tracked errorMessage = null;
  @tracked isErrorMessagePresent = false;
  @tracked isLoading = false;
  @tracked password = null;
  @tracked email = null;
  @tracked passwordValidationMessage = null;
  @tracked emailValidationMessage = null;

  ERROR_MESSAGES;

  get displayRecoveryLink() {
    if (this.intl.t('current-lang') === 'en' || !this.url.isFrenchDomainExtension) {
      return false;
    }
    return !this.args.isWithInvitation;
  }

  @action
  async authenticate(event) {
    event.preventDefault();

    this.isLoading = true;
    const email = this.email ? this.email.trim() : '';
    const password = this.password;

    if (this.args.isWithInvitation) {
      try {
        await this._acceptOrganizationInvitation(
          this.args.organizationInvitationId,
          this.args.organizationInvitationCode,
          email
        );
      } catch (errorResponse) {
        errorResponse.errors.forEach((error) => {
          if (error.status === '412') {
            return this._authenticate(password, email);
          }
        });
      }
    }

    return this._authenticate(password, email);
  }

  @action
  validatePassword(event) {
    this.password = event.target.value;
    const isInvalidInput = isEmpty(this.password);
    this.passwordValidationMessage = null;

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t('pages.login-form.errors.empty-password');
    }
  }

  @action
  validateEmail() {
    this.email = this.email.trim();
    const isInvalidInput = !isEmailValid(this.email);

    this.emailValidationMessage = null;

    if (isInvalidInput) {
      this.emailValidationMessage = this.intl.t('pages.login-form.errors.invalid-email');
    }
  }

  async _authenticate(password, email) {
    const scope = 'pix-orga';

    this.isErrorMessagePresent = false;
    this.errorMessage = '';

    this._initErrorMessages();

    try {
      await this.session.authenticate('authenticator:oauth2', email, password, scope);
    } catch (errorResponse) {
      this.errorMessage = this._handleResponseError(errorResponse);
      this.isErrorMessagePresent = true;
    } finally {
      this.isLoading = false;
    }
  }

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, email) {
    return this.store
      .createRecord('organization-invitation-response', {
        id: organizationInvitationId + '_' + organizationInvitationCode,
        code: organizationInvitationCode,
        email,
      })
      .save({ adapterOptions: { organizationInvitationId } });
  }

  _handleResponseError(errorResponse) {
    const errors = get(errorResponse, 'responseJSON.errors');

    if (Array.isArray(errors)) {
      const error = errors[0];
      switch (error.status) {
        case '400':
          return this.ERROR_MESSAGES.STATUS_400;
        case '401':
          return error.code === 'SHOULD_CHANGE_PASSWORD'
            ? this.ERROR_MESSAGES.STATUS_401_SHOULD_CHANGE_PASSWORD
            : this.ERROR_MESSAGES.STATUS_401;
        case '403':
          return this.ERROR_MESSAGES.STATUS_403;
        default:
          return this.ERROR_MESSAGES.DEFAULT;
      }
    } else {
      return this.ERROR_MESSAGES.DEFAULT;
    }
  }

  _initErrorMessages() {
    this.ERROR_MESSAGES = {
      DEFAULT: this.intl.t('api-errors-messages.default'),
      STATUS_400: this.intl.t('api-errors-messages.bad-request'),
      STATUS_401: this.intl.t('pages.login-form.errors.status.401'),
      STATUS_401_SHOULD_CHANGE_PASSWORD: this.intl.t('pages.login-form.errors.status.401-should-change-password'),
      STATUS_403: this.intl.t('pages.login-form.errors.status.403'),
    };
  }
}
