import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmailValid from '../../utils/email-validator';
import isEmpty from 'lodash/isEmpty';

const ERROR_INPUT_MESSAGE_MAP = {
  unknownError: 'Une erreur est survenue. Veuillez recommencer ou contacter le support.',
  expiredAuthenticationKey: "Votre demande d'authentification a expiré.",
  invalidEmail: 'Votre adresse e-mail n’est pas valide.',
  accountConflict:
    'Ce compte est déjà associé à cet organisme. Veuillez vous connecter avec un autre compte ou contacter le support.',
  loginUnauthorizedError: "L'adresse e-mail et/ou le mot de passe saisis sont incorrects.",
};

export default class LoginOrRegisterOidcComponent extends Component {
  @service oidcIdentityProviders;
  @service store;
  @service session;

  @tracked loginErrorMessage = null;
  @tracked email = '';
  @tracked password = '';
  @tracked emailValidationStatus = 'default';
  @tracked emailValidationMessage = null;
  @tracked isLoginLoading = false;

  get identityProviderOrganizationName() {
    return this.oidcIdentityProviders[this.args.identityProviderSlug]?.organizationName;
  }

  get givenName() {
    return this.args.givenName;
  }

  get familyName() {
    return this.args.familyName;
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
      this.emailValidationMessage = ERROR_INPUT_MESSAGE_MAP['invalidEmail'];
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
      await this.session.authenticate('authenticator:oidc', {
        email: this.email,
        password: this.password,
        authenticationKey: this.args.authenticationKey,
        identityProviderSlug: this.args.identityProviderSlug,
        hostSlug: 'user/reconcile',
      });
    } catch (error) {
      const status = get(error, 'errors[0].status');

      const errorsMapping = {
        401: ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey'],
        404: ERROR_INPUT_MESSAGE_MAP['loginUnauthorizedError'],
        409: ERROR_INPUT_MESSAGE_MAP['accountConflict'],
      };
      this.loginErrorMessage = errorsMapping[status] || ERROR_INPUT_MESSAGE_MAP['unknownError'];
    } finally {
      this.isLoginLoading = false;
    }
  }
}
