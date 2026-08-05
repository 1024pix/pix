import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import { FormValidation } from 'mon-pix/utils/form-validation';

const VALIDATION_ERRORS = {
  login: 'components.authentication.login-form.fields.login.error',
  password: 'components.authentication.login-form.fields.password.error',
};

export default class LoginForm extends Component {
  @service url;
  @service session;
  @service storage;
  @service store;
  @service router;
  @service errorMessages;

  @tracked login = null;
  @tracked password = null;
  @tracked globalError = null;
  @tracked isLoading = false;

  validation = new FormValidation({
    login: {
      validate: (value) => Boolean(value),
      error: VALIDATION_ERRORS.login,
    },
    password: {
      validate: (value) => Boolean(value),
      error: VALIDATION_ERRORS.password,
    },
  });

  @action
  async signin(event) {
    if (event) event.preventDefault();

    const formValues = { login: this.login, password: this.password };

    const isValid = this.validation.validateAll(formValues);
    if (!isValid) return;

    this.isLoading = true;

    try {
      await this.session.authenticateUser(this.login, this.password);
    } catch (responseError) {
      this._handleApiError(responseError);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  updateLogin(event) {
    this.login = event.target.value?.trim();
    this.validation.login.validate(this.login);
    this.storage.setLogin(this.login);
  }

  @action
  updatePassword(event) {
    this.password = event.target.value?.trim();
    this.validation.password.validate(this.password);
  }

  async _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 ? errors[0] : null;

    if (error?.code === 'SHOULD_CHANGE_PASSWORD') {
      const passwordResetToken = error.meta;
      return this._updateExpiredPassword(passwordResetToken);
    }

    if (['MISSING_OR_INVALID_CREDENTIALS', 'USER_IS_TEMPORARY_BLOCKED', 'USER_IS_BLOCKED'].includes(error?.code)) {
      this.password = null;
    }

    this.globalError = this.errorMessages.getAuthenticationErrorMessage(error);
  }

  async _updateExpiredPassword(passwordResetToken) {
    this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
    // TODO: peut-on passer le passwordResetToken en query params ?
    return this.router.replaceWith('update-expired-password');
  }

  <template>
    <form {{on "submit" this.signin}} class="authentication-login-form">
      {{#if this.globalError}}
        <PixNotificationAlert @type="error" role="alert">
          {{this.globalError}}
        </PixNotificationAlert>
      {{/if}}

      <p class="authentication-login-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <fieldset>
        <legend class="sr-only">{{t "pages.sign-in.fields.legend"}}</legend>

        <PixInput
          @id="login"
          name="login"
          {{on "input" this.updateLogin}}
          placeholder={{t "pages.sign-in.fields.login.placeholder"}}
          @validationStatus={{this.validation.login.status}}
          @errorMessage={{t this.validation.login.error}}
          autocomplete="email"
          aria-required="true"
        >
          <:label>{{t "pages.sign-in.fields.login.label"}}</:label>
        </PixInput>

        <div class="authentication-login-form__password">
          <PixInputPassword
            @id="password"
            name="password"
            {{on "input" this.updatePassword}}
            @value={{this.password}}
            @validationStatus={{this.validation.password.status}}
            @errorMessage={{t this.validation.password.error}}
            autocomplete="current-password"
            aria-required="true"
          >
            <:label>{{t "pages.sign-in.fields.password.label"}}</:label>
          </PixInputPassword>

          <LinkTo @route="password-reset-demand" class="link link--grey pix-body-s">
            {{t "pages.sign-in.forgotten-password"}}
          </LinkTo>
        </div>
      </fieldset>

      <PixButton @type="submit" @isLoading={{this.isLoading}}>
        {{t "pages.sign-in.actions.submit"}}
      </PixButton>
    </form>
  </template>
}
