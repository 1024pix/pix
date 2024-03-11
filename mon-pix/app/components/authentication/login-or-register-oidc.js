import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import isEmailValid from '../../utils/email-validator';

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
  @tracked loginErrorMessage = null;
  @tracked registerErrorMessage = null;
  @tracked email = '';
  @tracked password = '';
  @tracked emailValidationStatus = 'default';
  @tracked emailValidationMessage = null;
  @tracked isLoginLoading = false;
  @tracked isRegisterLoading = false;

  get identityProviderOrganizationName() {
    return this.oidcIdentityProviders[this.args.identityProviderSlug]?.organizationName;
  }

  get givenName() {
    return this.args.givenName;
  }

  get familyName() {
    return this.args.familyName;
  }

  get currentLanguage() {
    return this.intl.primaryLocale;
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
      switch (error?.code) {
        case 'INVALID_LOCALE_FORMAT':
          this.registerErrorMessage = this.intl.t('pages.sign-up.errors.invalid-locale-format', {
            invalidLocale: error.meta.locale,
          });
          return;
        case 'LOCALE_NOT_SUPPORTED':
          this.registerErrorMessage = this.intl.t('pages.sign-up.errors.locale-not-supported', {
            localeNotSupported: error.meta.locale,
          });
          return;
      }
      if (error.status === '401') {
        this.registerErrorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']);
      } else {
        this.registerErrorMessage =
          this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']) + (error.detail ? ` (${error.detail})` : '');
      }
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
  async login(event) {
    event.preventDefault();

    this.loginErrorMessage = null;

    if (!this.isFormValid) return;

    this.isLoginLoading = true;

    try {
      await this.args.onLogin({ enteredEmail: this.email, enteredPassword: this.password });
    } catch (error) {
      const status = get(error, 'errors[0].status');

      const errorsMapping = {
        401: this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']),
        404: this.intl.t(ERROR_INPUT_MESSAGE_MAP['loginUnauthorizedError']),
        409: this.intl.t(ERROR_INPUT_MESSAGE_MAP['accountConflict']),
      };
      this.loginErrorMessage = errorsMapping[status] || this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']);
    } finally {
      this.isLoginLoading = false;
    }
  }

  @action
  onChange(event) {
    this.isTermsOfServiceValidated = !!event.target.checked;
  }
}
