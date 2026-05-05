import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import isEmailValid from '../../utils/email-validator';

const ERROR_INPUT_MESSAGE_MAP = {
  termsOfServiceNotSelected: 'pages.oidc-signup-or-login.error.error-message',
  invalidEmail: 'pages.oidc-signup-or-login.error.invalid-email',
};

export default class OidcSignupOrLoginComponent extends Component {
  <template>
    <h1 class="oidc-signup-or-login-form__title">{{t "pages.oidc-signup-or-login.title"}}</h1>
    <div class="oidc-signup-or-login-form__container">
      <div class="oidc-signup-or-login-form__signup-container">
        <h2 class="oidc-signup-or-login-form__subtitle">{{t "pages.oidc-signup-or-login.signup-form.title"}}</h2>
        {{#if this.userClaimsToDisplay.length}}
          <div>
            <p class="oidc-signup-or-login-form__description">
              {{! template-lint-disable "no-bare-strings" }}
              {{t "pages.oidc-signup-or-login.signup-form.description"}}
              <em>{{this.identityProviderOrganizationName}}</em>&nbsp;:
            </p>
            <div class="oidc-signup-or-login-form__information">
              <ul>
                {{#each this.userClaimsToDisplay as |userClaimToDisplay|}}
                  <li>{{userClaimToDisplay}}</li>
                {{/each}}
              </ul>
            </div>
          </div>
          <div class="oidc-signup-or-login-form__cgu-container">
            <PixCheckbox {{on "change" this.onChange}}>
              <:label>{{t
                  "common.cgu.message"
                  cguUrl=this.cguUrl
                  dataProtectionPolicyUrl=this.dataProtectionPolicyUrl
                  htmlSafe=true
                }}</:label>
            </PixCheckbox>
          </div>

          {{#if this.registerErrorMessage}}
            <PixNotificationAlert @type="error" class="oidc-signup-or-login-form__cgu-error">
              {{this.registerErrorMessage}}
            </PixNotificationAlert>
          {{/if}}

          <PixButton @type="submit" @triggerAction={{this.register}} @isLoading={{this.isRegisterLoading}}>
            {{t "pages.oidc-signup-or-login.signup-form.button"}}
          </PixButton>
        {{else}}
          <PixNotificationAlert @type="error" class="oidc-signup-or-login-form__cgu-error">
            {{this.userClaimsErrorMessage}}
          </PixNotificationAlert>
        {{/if}}
      </div>

      <div class="oidc-signup-or-login-form__divider"></div>

      <div class="oidc-signup-or-login-form__login-container">
        <h2 class="oidc-signup-or-login-form__subtitle">{{t "pages.oidc-signup-or-login.login-form.title"}}</h2>
        <p class="oidc-signup-or-login-form__description">
          {{t "pages.oidc-signup-or-login.login-form.description"}}
        </p>
        <form {{on "submit" this.login}}>
          <p class="oidc-signup-or-login-form__mandatory-description">{{t "common.form.mandatory-all-fields"}}</p>

          <div class="oidc-signup-or-login-form__input-container">
            <PixInput
              @id="email"
              name="email"
              @errorMessage={{this.emailValidationMessage}}
              @validationStatus={{this.emailValidationStatus}}
              {{on "change" this.validateEmail}}
              autocomplete="off"
              required
            >
              <:label>{{t "pages.oidc-signup-or-login.login-form.email"}}</:label>
            </PixInput>
          </div>

          <div class="oidc-signup-or-login-form__input-container oidc-signup-or-login-form__input-container--password">
            <PixInputPassword
              @id="password"
              @value={{this.password}}
              autocomplete="off"
              required
              {{on "change" this.setPassword}}
            >
              <:label>{{t "pages.oidc-signup-or-login.login-form.password"}}</:label>
            </PixInputPassword>
            <LinkTo @route="password-reset-demand" class="oidc-signup-or-login-form__forgotten-password-link">
              {{t "pages.sign-in.forgotten-password"}}
            </LinkTo>
          </div>

          {{#if this.loginErrorMessage}}
            <PixNotificationAlert @type="error" class="oidc-signup-or-login-form__cgu-error">
              {{this.loginErrorMessage}}
            </PixNotificationAlert>
          {{/if}}

          <PixButton @type="submit" @isLoading={{this.isLoginLoading}} class="oidc-signup-or-login-form__submit-button">
            {{t "pages.oidc-signup-or-login.login-form.button"}}
          </PixButton>
        </form>
      </div>
    </div>
  </template>
  @service intl;
  @service locale;
  @service session;
  @service currentDomain;
  @service oidcIdentityProviders;
  @service store;
  @service url;
  @service errorMessages;

  @tracked isTermsOfServiceValidated = false;
  @tracked loginErrorMessage = null;
  @tracked registerErrorMessage = null;
  @tracked email = '';
  @tracked password = '';
  @tracked emailValidationStatus = 'default';
  @tracked emailValidationMessage = null;
  @tracked isLoginLoading = false;
  @tracked isRegisterLoading = false;

  get identityProviderOrganizationName() {
    return this.oidcIdentityProviders.findBySlug(this.args.identityProviderSlug)?.organizationName;
  }

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get userClaimsErrorMessage() {
    const { userClaims } = this.args;

    if (!userClaims) {
      return this.intl.t(`pages.oidc-signup-or-login.signup-form.error`);
    } else {
      return null;
    }
  }

  get userClaimsToDisplay() {
    const { userClaims } = this.args;

    const result = [];

    if (userClaims) {
      const { firstName, lastName, ...rest } = userClaims;
      result.push(this.intl.t('pages.oidc-signup-or-login.signup-form.first-name-label-and-value', { firstName }));
      result.push(this.intl.t('pages.oidc-signup-or-login.signup-form.last-name-label-and-value', { lastName }));

      Object.entries(rest).map(([key, _value]) => {
        let label = `${this.intl.t(`pages.oidc-signup-or-login.signup-form.claims.${key}`)}`;

        if (label.includes('Missing translation')) {
          label = key;
        }

        return result.push(label);
      });
    }

    return result;
  }

  @action
  async login(event) {
    event.preventDefault();

    this.loginErrorMessage = null;

    if (!this.isFormValid) return;

    this.isLoginLoading = true;

    try {
      await this.args.onLogin({ enteredEmail: this.email, enteredPassword: this.password });
    } catch (responseError) {
      const errors = get(responseError, 'errors');
      const error = Array.isArray(errors) && errors.length > 0 ? errors[0] : null;

      if (['MISSING_OR_INVALID_CREDENTIALS', 'USER_IS_TEMPORARY_BLOCKED', 'USER_IS_BLOCKED'].includes(error?.code)) {
        this.password = null;
      }

      this.loginErrorMessage = this.errorMessages.getAuthenticationErrorMessage(responseError);
    } finally {
      this.isLoginLoading = false;
    }
  }

  @action
  async register() {
    if (!this.isTermsOfServiceValidated) {
      this.registerErrorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['termsOfServiceNotSelected']);
      return;
    }

    this.isRegisterLoading = true;
    this.registerErrorMessage = null;

    try {
      await this.session.authenticate('authenticator:oidc', {
        authenticationKey: this.args.authenticationKey,
        identityProviderSlug: this.args.identityProviderSlug,
        hostSlug: 'users',
      });
    } catch (responseError) {
      const error = get(responseError, 'errors[0]');
      this.registerErrorMessage = this.errorMessages.getAuthenticationErrorMessage(error);
    } finally {
      this.isRegisterLoading = false;
    }
  }

  @action
  validateEmail(event) {
    this.email = event.target.value;
    this.email = this.email.trim();
    const isInvalidInput = !isEmailValid(this.email);

    this.emailValidationMessage = null;
    this.emailValidationStatus = 'default';

    if (isInvalidInput) {
      this.emailValidationStatus = 'error';
      this.emailValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidEmail']);
    }
  }

  @action
  setPassword(event) {
    this.password = event.target.value;
  }

  get isFormValid() {
    return isEmailValid(this.email) && !isEmpty(this.password);
  }

  @action
  onChange(event) {
    this.isTermsOfServiceValidated = !!event.target.checked;
  }
}
