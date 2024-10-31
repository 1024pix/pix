import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

const HTTP_ERROR_MESSAGES = {
  400: { key: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY },
  401: { key: ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY },
  422: { key: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY },
  504: { key: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY },
  default: { key: 'common.api-error-messages.login-unexpected-error', values: { htmlSafe: true } },
};

export default class SigninForm extends Component {
  @service url;
  @service session;
  @service store;
  @service router;

  @tracked login = null;
  @tracked password = null;
  @tracked globalError = null;
  @tracked isLoading = false;

  @action
  async signin(event) {
    if (event) event.preventDefault();
    this.isLoading = true;

    try {
      await this.session.authenticateUser(this.login, this.password);
    } catch (responseError) {
      this._handleApiError(responseError);
    } finally {
      this.isLoading = false;
    }
  }

  get isFormDisabled() {
    return !this.login || !this.password;
  }

  @action
  updateLogin(event) {
    this.login = event.target.value?.trim();
  }

  @action
  updatePassword(event) {
    this.password = event.target.value?.trim();
  }

  async _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];

    switch (error?.code) {
      case 'INVALID_LOCALE_FORMAT':
        this.globalError = {
          key: 'pages.sign-up.errors.invalid-locale-format',
          values: { invalidLocale: error.meta.locale },
        };
        break;
      case 'LOCALE_NOT_SUPPORTED':
        this.globalError = {
          key: 'pages.sign-up.errors.locale-not-supported',
          values: { localeNotSupported: error.meta.locale },
        };
        break;
      case 'SHOULD_CHANGE_PASSWORD': {
        const passwordResetToken = error.meta;
        await this._updateExpiredPassword(passwordResetToken);
        break;
      }
      case 'USER_IS_TEMPORARY_BLOCKED':
        this.globalError = {
          key: ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY,
          values: {
            url: '/mot-de-passe-oublie',
            htmlSafe: true,
          },
        };
        break;
      case 'USER_IS_BLOCKED':
        this.globalError = {
          key: ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY,
          values: {
            url: 'https://support.pix.org/support/tickets/new',
            htmlSafe: true,
          },
        };
        break;
      default:
        this.globalError = HTTP_ERROR_MESSAGES[responseError.status] || HTTP_ERROR_MESSAGES['default'];
    }
  }

  async _updateExpiredPassword(passwordResetToken) {
    this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
    return this.router.replaceWith('update-expired-password');
  }

  <template>
    <form {{on "submit" this.signin}} class="signin-form">
      {{#if this.globalError}}
        <PixMessage @type="error" @withIcon={{true}} role="alert">
          {{t this.globalError.key this.globalError.values}}
        </PixMessage>
      {{/if}}

      <p class="signin-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <fieldset>
        <legend class="sr-only">{{t "pages.sign-in.fields.legend"}}</legend>

        <PixInput
          @id="login"
          name="login"
          {{on "input" this.updateLogin}}
          placeholder={{t "pages.sign-in.fields.login.placeholder"}}
          autocomplete="email"
          required
        >
          <:label>{{t "pages.sign-in.fields.login.label"}}</:label>
        </PixInput>

        <div class="signin-form__password">
          <PixInputPassword
            @id="password"
            name="password"
            {{on "input" this.updatePassword}}
            autocomplete="current-password"
            required
          >
            <:label>{{t "pages.sign-in.fields.password.label"}}</:label>
          </PixInputPassword>

          <LinkTo @route="password-reset-demand" class="link link--grey pix-body-s">
            {{t "pages.sign-in.forgotten-password"}}
          </LinkTo>
        </div>
      </fieldset>

      <PixButton @type="submit" @isLoading={{this.isLoading}} @isDisabled={{this.isFormDisabled}}>
        {{t "pages.sign-in.actions.submit"}}
      </PixButton>
    </form>
  </template>
}
