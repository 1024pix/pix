/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import Component from '@ember/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

import isPasswordValid from '../utils/password-validator';

const ERROR_PASSWORD_MESSAGE = 'pages.update-expired-password.fields.error';

const VALIDATION_MAP = {
  default: {
    status: 'default',
    message: null,
  },
  error: {
    status: 'error',
    message: ERROR_PASSWORD_MESSAGE,
  },
};

export default class UpdateExpiredPasswordForm extends Component {
  <template>
    <div class="update-expired-password-form__container">

      <a href={{this.showcase.url}} class="pix-logo__link">
        <img class="pix-logo__image" src="/images/pix-logo.svg" alt="{{this.showcase.linkText}}" />
      </a>

      <div class="update-expired-password-form__header">
        <h1 class="update-expired-password-form-title">{{t "pages.update-expired-password.first-title"}}</h1>

        {{#unless this.authenticationHasFailed}}
          <p class="update-expired-password-form-subtitle" id="update-expired-password-authentication-failed-message">
            {{t "pages.update-expired-password.subtitle"}}
          </p>
        {{/unless}}
      </div>

      {{#if this.errorMessage}}
        <p
          class="update-expired-password-form__error-notification-message"
          aria-live="polite"
          role="alert"
          id="update-expired-password-error-message"
        >
          {{this.errorMessage}}
        </p>
      {{/if}}

      {{#unless this.authenticationHasFailed}}
        <form {{on "submit" this.handleUpdatePasswordAndAuthenticate}} class="update-expired-password-form__body">
          <PixInputPassword
            @id="password"
            name="password"
            @value={{this.newPassword}}
            @subLabel={{t "pages.update-expired-password.fields.help"}}
            {{on "focusout" this.validatePassword}}
            {{on "input" this.handleInputChange}}
            @requiredLabel={{true}}
            @validationStatus={{this.validation.status}}
            @errorMessage={{this.validationMessage}}
            autocomplete="off"
          >
            <:label>{{t "pages.update-expired-password.fields.label"}}</:label>
          </PixInputPassword>

          <PixButton @type="submit" @isLoading={{this.isLoading}}>
            {{t "pages.update-expired-password.button"}}
          </PixButton>
        </form>
      {{/unless}}

      {{#if this.authenticationHasFailed}}
        <div class="update-expired-password-form__body">
          <p class="update-expired-password-form-text" aria-live="polite">
            {{t "pages.update-expired-password.validation"}}
          </p>
          <LinkTo @route="authentication.login" class="button button--link button--thin button--round">
            {{t "pages.update-expired-password.go-to-login"}}
          </LinkTo>
        </div>
      {{/if}}
    </div>
  </template>
  @service intl;
  @service session;
  @service url;
  @service errorMessages;
  @service('reset-expired-password-demand') resetExpiredPasswordDemandService;

  @tracked validation = VALIDATION_MAP.default;
  @tracked newPassword = null;
  @tracked isLoading = false;
  @tracked authenticationHasFailed = null;

  @tracked errorMessage = null;

  get showcase() {
    return this.url.showcase;
  }

  get validationMessage() {
    if (this.validation.message) {
      return this.intl.t(this.validation.message);
    }
    return null;
  }

  @action
  validatePassword() {
    this.errorMessage = null;
    const validationStatus = isPasswordValid(this.newPassword) ? 'default' : 'error';
    this.validation = VALIDATION_MAP[validationStatus];
  }

  @action
  handleInputChange(event) {
    this.newPassword = event.target.value;
  }

  @action
  async handleUpdatePasswordAndAuthenticate(event) {
    event && event.preventDefault();

    this.validatePassword();

    if (!this.validation.message) {
      this.isLoading = true;
      this.authenticationHasFailed = false;
      this.validation = VALIDATION_MAP.default;

      try {
        const login = await this.resetExpiredPasswordDemandService.updateExpiredPassword({
          newPassword: this.newPassword,
          passwordResetToken: this.passwordResetToken,
        });

        try {
          await this.session.authenticateUser(login, this.newPassword);
        } catch {
          this.authenticationHasFailed = true;
        }
      } catch (errorResponse) {
        const error = get(errorResponse, 'errors[0]');
        this._manageErrorsApi(error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  _manageErrorsApi(error) {
    const statusCode = get(error, 'status');
    const code = get(error, 'code');
    if (code === 'PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED') {
      this.errorMessage = this.errorMessages.getAuthenticationErrorMessage(error);
    } else if (statusCode === '400') {
      this.validation = VALIDATION_MAP.error;
    } else if (statusCode === '404' && code === 'USER_ACCOUNT_NOT_FOUND') {
      this.errorMessage = this.intl.t('common.error');
    } else {
      this.errorMessage = this._showErrorMessages(statusCode);
    }
  }

  _showErrorMessages(statusCode) {
    const httpStatusCodeMessages = {
      401: ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY,
      default: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
