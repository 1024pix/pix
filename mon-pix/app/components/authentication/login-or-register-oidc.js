import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import IdentityProviders from 'mon-pix/identity-providers';
import isEmailValid from '../../utils/email-validator';
import isEmpty from 'lodash/isEmpty';

const ERROR_INPUT_MESSAGE_MAP = {
  termsOfServiceNotSelected: 'pages.login-or-register-oidc.error.error-message',
  unknownError: 'common.error',
  expiredAuthenticationKey: 'pages.login-or-register-oidc.error.expired-authentication-key',
  invalidEmail: 'pages.login-or-register-oidc.error.invalid-email',
};

export default class LoginOrRegisterOidcComponent extends Component {
  @service url;
  @service intl;
  @service session;
  @service currentDomain;
  @service store;

  @tracked isTermsOfServiceValidated = false;
  @tracked isAuthenticationKeyExpired = false;
  @tracked errorMessage = null;
  @tracked email = '';
  @tracked password = '';
  @tracked emailValidationMessage = null;

  get identityProviderOrganizationName() {
    return IdentityProviders[this.args.identityProviderSlug].organizationName;
  }

  get currentLanguage() {
    return this.intl.t('current-lang');
  }

  get homeUrl() {
    return this.url.homeUrl;
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
  async submit() {
    if (this.isTermsOfServiceValidated) {
      this.errorMessage = null;
      try {
        await this.session.authenticate('authenticator:oidc', {
          authenticationKey: this.args.authenticationKey,
          identityProviderSlug: this.args.identityProviderSlug,
        });
      } catch (error) {
        const status = get(error, 'errors[0].status');
        if (status === '401') {
          this.isAuthenticationKeyExpired = true;
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']);
        } else {
          const errorDetail = get(error, 'errors[0].detail');
          this.errorMessage =
            this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']) + (errorDetail ? ` (${errorDetail})` : '');
        }
      }
    } else {
      this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['termsOfServiceNotSelected']);
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
    if (this.isFormValid) {
      const identityProvider = IdentityProviders[this.args.identityProviderSlug]?.code;
      try {
        const authenticationRequest = this.store.createRecord('user-oidc-authentication-request', {
          password: this.password,
          email: this.email,
          authenticationKey: this.args.authenticationKey,
          identityProvider,
        });
        await authenticationRequest.login();
        this.args.toggleOidcReconciliation();
      } catch (error) {
        return error;
      }
    }
  }

  @action
  onChange(event) {
    this.isTermsOfServiceValidated = !!event.target.checked;
  }
}
