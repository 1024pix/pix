import { action } from '@ember/object';
import isEmpty from 'lodash/isEmpty';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import ENV from 'pix-orga/config/environment';
import isEmailValid from '../../utils/email-validator';

export default class LoginForm extends Component {
  @service url;
  @service intl;
  @service session;
  @service store;

  @tracked errorMessage = null;
  @tracked isLoading = false;
  @tracked password = null;
  @tracked email = null;
  @tracked passwordValidationMessage = null;
  @tracked emailValidationMessage = null;

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

    if (!this.isFormValid) {
      this.isLoading = false;
      return;
    }

    if (this.args.isWithInvitation) {
      try {
        await this._acceptOrganizationInvitation(
          this.args.organizationInvitationId,
          this.args.organizationInvitationCode,
          email
        );
      } catch (err) {
        const error = err.errors[0];
        const isInvitationAlreadyAcceptedByAnotherUser = error.status === '409';
        if (isInvitationAlreadyAcceptedByAnotherUser) {
          this.errorMessage = this.intl.t('pages.login-form.errors.status.409');
          this.isLoading = false;
          return;
        }
        const isUserAlreadyOrganizationMember = error.status === '412';
        if (!isUserAlreadyOrganizationMember) {
          this.errorMessage = this.intl.t(this._getI18nKeyByStatus(error.status));
          this.isLoading = false;
          return;
        }
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
  validateEmail(event) {
    this.email = event.target.value?.trim();
    const isInvalidInput = !isEmailValid(this.email);

    this.emailValidationMessage = null;

    if (isInvalidInput) {
      this.emailValidationMessage = this.intl.t('pages.login-form.errors.invalid-email');
    }
  }

  @action
  updateEmail(event) {
    this.email = event.target.value?.trim();
  }

  get isFormValid() {
    return isEmailValid(this.email) && !isEmpty(this.password);
  }

  async _authenticate(password, email) {
    const scope = 'pix-orga';

    this.errorMessage = null;
    try {
      await this.session.authenticate('authenticator:oauth2', email, password, scope);
    } catch (responseError) {
      this._handleApiError(responseError);
    } finally {
      this.isLoading = false;
    }
  }

  async _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, email) {
    const type = 'organization-invitation-response';
    const id = `${organizationInvitationId}_${organizationInvitationCode}`;
    const record = this.store.peekRecord(type, id);
    if (!record) {
      await this.store
        .createRecord(type, { id, code: organizationInvitationCode, email })
        .save({ adapterOptions: { organizationInvitationId } });
    }
  }

  _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'SHOULD_CHANGE_PASSWORD':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.SHOULD_CHANGE_PASSWORD.I18N_KEY, {
          url: this.url.forgottenPasswordUrl,
          htmlSafe: true,
        });
        break;
      case 'USER_IS_TEMPORARY_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
          url: this.url.forgottenPasswordUrl,
          htmlSafe: true,
        });
        break;
      case 'USER_IS_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY, {
          url: 'https://support.pix.org/support/tickets/new',
          htmlSafe: true,
        });
        break;
      default:
        this.errorMessage = this.intl.t(this._getI18nKeyByStatus(responseError.status));
    }
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case 400:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 401:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY;
      // TODO: This case should be handled with a specific error code like USER_IS_TEMPORARY_BLOCKED or USER_IS_BLOCKED
      case 403:
        return ENV.APP.API_ERROR_MESSAGES.NOT_LINKED_ORGANIZATION.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }
}
