import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class AuthenticationMethod extends Component {
  @service notifications;
  @service accessControl;
  @service oidcIdentityProviders;

  @tracked showAddAuthenticationMethodModal = false;
  @tracked showReassignGarAuthenticationMethodModal = false;
  @tracked showReassignOidcAuthenticationMethodModal = false;
  @tracked newEmail = '';
  @tracked targetUserId = '';
  @tracked showAlreadyExistingEmailError = false;
  @tracked selectedOidcAuthenticationMethod = null;

  get hasPixAuthenticationMethod() {
    return this.args.user.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'PIX'
    );
  }

  get pixAuthenticationMethod() {
    return this.args.user.authenticationMethods.find(
      (authenticationMethod) => authenticationMethod.identityProvider === 'PIX'
    );
  }

  get hasEmailAuthenticationMethod() {
    return (
      this.args.user.email &&
      this.args.user.authenticationMethods.any(
        (authenticationMethod) => authenticationMethod.identityProvider === 'PIX'
      )
    );
  }

  get hasUsernameAuthenticationMethod() {
    return (
      this.args.user.username &&
      this.args.user.authenticationMethods.any(
        (authenticationMethod) => authenticationMethod.identityProvider === 'PIX'
      )
    );
  }

  get hasGarAuthenticationMethod() {
    return this.args.user.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR'
    );
  }

  get isAllowedToRemoveEmailAuthenticationMethod() {
    return this.hasEmailAuthenticationMethod && this._hasMultipleAuthenticationMethods();
  }

  get isAllowedToRemoveUsernameAuthenticationMethod() {
    return this.hasUsernameAuthenticationMethod && this._hasMultipleAuthenticationMethods();
  }

  get isAllowedToRemoveGarAuthenticationMethod() {
    return this.hasGarAuthenticationMethod && this._hasMultipleAuthenticationMethods();
  }

  get isAllowedToAddEmailAuthenticationMethod() {
    return !this.hasPixAuthenticationMethod;
  }

  _hasMultipleAuthenticationMethods() {
    const userAuthenticationMethods = this.args.user.authenticationMethods;
    const hasUsername = !!this.args.user.username;
    const hasEmail = !!this.args.user.email;

    return userAuthenticationMethods.length > 1 || (userAuthenticationMethods.length === 1 && hasUsername && hasEmail);
  }

  get oidcAuthenticationMethods() {
    return this.oidcIdentityProviders.list.map((oidcIdentityProvider) => {
      const hasAuthenticationMethod = this.args.user.authenticationMethods.any(
        (authenticationMethod) => authenticationMethod.identityProvider === oidcIdentityProvider.code
      );

      return {
        code: oidcIdentityProvider.code,
        name: oidcIdentityProvider.organizationName,
        hasAuthenticationMethod,
        canBeRemoved: hasAuthenticationMethod && this._hasMultipleAuthenticationMethods(),
        canBeReassigned: hasAuthenticationMethod,
      };
    });
  }

  @action
  toggleAddAuthenticationMethodModal() {
    this.showAddAuthenticationMethodModal = !this.showAddAuthenticationMethodModal;
    this.showAlreadyExistingEmailError = false;
    this.newEmail = '';
  }

  @action
  toggleReassignGarAuthenticationMethodModal() {
    this.showReassignGarAuthenticationMethodModal = !this.showReassignGarAuthenticationMethodModal;
    this.targetUserId = '';
  }

  @action
  async submitAddingPixAuthenticationMethod(event) {
    event.preventDefault();
    try {
      await this.args.addPixAuthenticationMethod(this.newEmail);
      this.notifications.success(`${this.newEmail} a bien été rajouté aux méthodes de connexion de l'utilisateur`);
      this.newEmail = '';
      this.showAddAuthenticationMethodModal = false;
      this.showAlreadyExistingEmailError = false;
    } catch (response) {
      const errors = response.errors;
      const emailAlreadyExistingError = errors.any(
        (error) => error.status === '400' && error.code === 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS'
      );

      if (emailAlreadyExistingError) {
        this.showAlreadyExistingEmailError = true;
      } else {
        this.showAddAuthenticationMethodModal = false;
        this.notifications.error('Une erreur est survenue, veuillez réessayer.');
        this.newEmail = '';
        this.showAlreadyExistingEmailError = false;
      }
    }
  }

  @action
  async submitReassignGarAuthenticationMethod(event) {
    event.preventDefault();
    await this.args.reassignAuthenticationMethod({ targetUserId: this.targetUserId, identityProvider: 'GAR' });
    this.showReassignGarAuthenticationMethodModal = false;
  }

  @action
  onChangeNewEmail(event) {
    this.newEmail = event.target.value;
  }

  @action
  onChangeTargetUserId(event) {
    this.targetUserId = event.target.value;
  }

  @action
  toggleReassignOidcAuthenticationMethodModal(oidcAuthenticationMethod) {
    this.targetUserId = '';
    this.selectedOidcAuthenticationMethod = oidcAuthenticationMethod ? { ...oidcAuthenticationMethod } : null;
    this.showReassignOidcAuthenticationMethodModal = !this.showReassignOidcAuthenticationMethodModal;
  }

  @action
  async submitReassignOidcAuthenticationMethod(oidcAuthenticationMethodCode) {
    await this.args.reassignAuthenticationMethod({
      targetUserId: this.targetUserId,
      identityProvider: oidcAuthenticationMethodCode,
    });

    this.showReassignOidcAuthenticationMethodModal = false;
  }
}
