import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmailValid from '../../utils/email-validator';
import isEmpty from 'lodash/isEmpty';

const ERROR_INPUT_MESSAGE_MAP = {
  termsOfServiceNotSelected: 'pages.login-or-register-oidc.error.error-message',
  unknownError: 'common.error',
  expiredAuthenticationKey: 'pages.login-or-register-oidc.error.expired-authentication-key',
  invalidEmail: 'pages.login-or-register-oidc.error.invalid-email',
  accountConflict: 'pages.login-or-register-oidc.error.account-conflict',
  loginUnauthorizedError: 'pages.login-or-register-oidc.error.login-unauthorized-error',
};

export default class LoginOrRegisterOidcComponent extends Component {
  @service intl;
  @service session;
  @service currentDomain;
  @service oidcIdentityProviders;
  @service store;

  @tracked isTermsOfServiceValidated = false;
  @tracked loginError = false;
  @tracked registerError = false;
  @tracked loginErrorMessage = null;
  @tracked registerErrorMessage = null;
  @tracked email = '';
  @tracked password = '';
  @tracked emailValidationMessage = null;

  get identityProviderOrganizationName() {
    return this.oidcIdentityProviders[this.args.identityProviderSlug]?.organizationName;
  }

  get currentLanguage() {
    return this.intl.t('current-lang');
  }

  get cguUrl() {
    if (this.currentLanguage === 'en') {
      return 'https://pix.org/en-gb/terms-and-conditions';
    }
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }

  get dataProtectionPolicyUrl() {
    if (this.currentLanguage === 'en') {
      return 'https://pix.org/en-gb/personal-data-protection-policy';
    }
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }

  @action
  async register() {
    if (this.isTermsOfServiceValidated) {
      this.registerErrorMessage = null;
      this.registerError = false;
      try {
        await this.session.authenticate('authenticator:oidc', {
          authenticationKey: this.args.authenticationKey,
          identityProviderSlug: this.args.identityProviderSlug,
          hostSlug: 'users',
        });
      } catch (error) {
        this.registerError = true;
        const status = get(error, 'errors[0].status');
        if (status === '401') {
          this.registerErrorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']);
        } else {
          const errorDetail = get(error, 'errors[0].detail');
          this.registerErrorMessage =
            this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']) + (errorDetail ? ` (${errorDetail})` : '');
        }
      }
    } else {
      this.registerError = true;
      this.registerErrorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['termsOfServiceNotSelected']);
    }
  }

  @action
  validateEmail(event) {
    this.email = event.target.value;
    this.email = this.email.trim();
    const isInvalidInput = !isEmailValid(this.email);

    this.emailValidationMessage = null;

    if (isInvalidInput) {
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
  async login(event) {
    event.preventDefault();

    this.loginErrorMessage = null;
    this.loginError = false;

    if (!this.isFormValid) return;

    try {
      await this.args.onLogin({ enteredEmail: this.email, enteredPassword: this.password });
    } catch (error) {
      this.loginError = true;
      const status = get(error, 'errors[0].status');

      const errorsMapping = {
        401: this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']),
        404: this.intl.t(ERROR_INPUT_MESSAGE_MAP['loginUnauthorizedError']),
        409: this.intl.t(ERROR_INPUT_MESSAGE_MAP['accountConflict']),
      };
      this.loginErrorMessage = errorsMapping[status] || this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']);
    }
  }

  @action
  onChange(event) {
    this.isTermsOfServiceValidated = !!event.target.checked;
  }
}
