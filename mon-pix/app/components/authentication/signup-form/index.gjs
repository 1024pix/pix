import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

import { PASSWORD_RULES } from '../../../utils/password-validator.js';
import NewPasswordInput from '../new-password-input';
import CguCheckbox from './cgu-checkbox';
import { SignupFormValidation } from './signup-form-validation';

const HTTP_ERROR_MESSAGES = {
  400: { key: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY },
  504: { key: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY },
  default: { key: 'common.api-error-messages.login-unexpected-error', values: { htmlSafe: true } },
};

export default class SignupForm extends Component {
  @service session;
  @service intl;

  @tracked validation = new SignupFormValidation(this.intl);
  @tracked isLoading = false;
  @tracked globalError = null;

  @action
  handleInputChange(event) {
    const { user } = this.args;
    const { id, value, checked, type } = event.target;

    if (type === 'checkbox') {
      user[id] = Boolean(checked);
    } else {
      user[id] = value.trim();
    }

    this.validation.validateField(id, user[id]);
  }

  @action
  async handleSignup(event) {
    if (event) event.preventDefault();
    const { user } = this.args;

    if (!this.validation.isValid) return;

    this.isLoading = true;

    try {
      const campaignCode = get(this.session, 'attemptedTransition.from.parent.params.code');
      user.lang = this.intl.primaryLocale;

      await user.save({ adapterOptions: { campaignCode } });
      await this.session.authenticateUser(user.email, user.password);

      user.password = null;
    } catch (errorResponse) {
      // Error response format is different from EmberAdapter and EmberSimpleAuth
      const error = get(errorResponse, errorResponse?.isAdapterError ? 'errors[0]' : 'responseJSON.errors[0]');
      this._manageApiErrors(error);
    } finally {
      this.isLoading = false;
    }
  }

  _manageApiErrors(error) {
    const statusCode = error?.status;

    if (String(statusCode) === '422') {
      const errors = this.args.user.errors || [];
      return this.validation.setErrorsFromServer(errors);
    }

    switch (error?.code) {
      case 'INVALID_LOCALE_FORMAT':
        this.globalError = {
          key: 'components.authentication.signup-form.errors.invalid-locale-format',
          values: { invalidLocale: error.meta.locale },
        };
        return;
      case 'LOCALE_NOT_SUPPORTED':
        this.globalError = {
          key: 'components.authentication.signup-form.errors.locale-not-supported',
          values: { localeNotSupported: error.meta.locale },
        };
        return;
      default:
        this.globalError = HTTP_ERROR_MESSAGES[statusCode] || HTTP_ERROR_MESSAGES['default'];
        return;
    }
  }

  <template>
    <form {{on "submit" this.handleSignup}} class="signup-form">
      {{#if this.globalError}}
        <PixMessage @type="error" @withIcon="true" role="alert">
          {{t this.globalError.key this.globalError.values}}
        </PixMessage>
      {{/if}}

      <p class="signup-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <fieldset>
        <legend class="sr-only">{{t "components.authentication.signup-form.fields.legend"}}</legend>

        <PixInput
          @id="firstName"
          name="firstName"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.firstName.status}}
          @errorMessage={{this.validation.firstName.errorMessage}}
          placeholder={{t "components.authentication.signup-form.fields.firstname.placeholder"}}
          required
          autocomplete="given-name"
        >
          <:label>{{t "components.authentication.signup-form.fields.firstname.label"}}</:label>
        </PixInput>

        <PixInput
          @id="lastName"
          name="lastName"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.lastName.status}}
          @errorMessage={{this.validation.lastName.errorMessage}}
          placeholder={{t "components.authentication.signup-form.fields.lastname.placeholder"}}
          required
          autocomplete="family-name"
        >
          <:label>{{t "components.authentication.signup-form.fields.lastname.label"}}</:label>
        </PixInput>

        <PixInput
          @id="email"
          name="email"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.email.status}}
          @errorMessage={{this.validation.email.errorMessage}}
          placeholder={{t "components.authentication.signup-form.fields.email.placeholder"}}
          required
          autocomplete="email"
        >
          <:label>{{t "components.authentication.signup-form.fields.email.label"}}</:label>
        </PixInput>

        <NewPasswordInput
          @id="password"
          name="password"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.password.status}}
          @errorMessage={{this.validation.password.errorMessage}}
          @rules={{PASSWORD_RULES}}
          required
        />

        <CguCheckbox
          @id="cgu"
          name="cgu"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.cgu.status}}
          @errorMessage={{this.validation.cgu.errorMessage}}
          required
        />
      </fieldset>

      <PixButton @type="submit" @isLoading={{this.isLoading}} @size="large">
        {{t "components.authentication.signup-form.actions.submit"}}
      </PixButton>
    </form>
  </template>
}
