import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
  @tracked authenticationMethods = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.user.authenticationMethods).then((authenticationMethods) => {
      this.authenticationMethods = authenticationMethods;
    });
  }

  get hasPixAuthenticationMethod() {
    return this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX');
  }

  get shouldChangePassword() {
    return !!this.authenticationMethods.find((authenticationMethod) => authenticationMethod.identityProvider === 'PIX')
      ?.authenticationComplement?.shouldChangePassword;
  }

  get hasEmailAuthenticationMethod() {
    return (
      this.args.user.email &&
      this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX')
    );
  }

  get hasUsernameAuthenticationMethod() {
    return (
      this.args.user.username &&
      this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'PIX')
    );
  }

  get hasGarAuthenticationMethod() {
    return this.authenticationMethods.any((authenticationMethod) => authenticationMethod.identityProvider === 'GAR');
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
    const userAuthenticationMethods = this.authenticationMethods;
    const hasUsername = !!this.args.user.username;
    const hasEmail = !!this.args.user.email;

    return userAuthenticationMethods.length > 1 || (userAuthenticationMethods.length === 1 && hasUsername && hasEmail);
  }

  get userOidcAuthenticationMethods() {
    return this.oidcIdentityProviders.list.map((oidcIdentityProvider) => {
      const userHasThisOidcAuthenticationMethod = this.authenticationMethods.any(
        (authenticationMethod) => authenticationMethod.identityProvider === oidcIdentityProvider.code,
      );

      return {
        code: oidcIdentityProvider.code,
        name: oidcIdentityProvider.organizationName,
        userHasThisOidcAuthenticationMethod,
        canBeRemovedFromUserAuthenticationMethods:
          userHasThisOidcAuthenticationMethod && this._hasMultipleAuthenticationMethods(),
        canBeReassignedToAnotherUser: userHasThisOidcAuthenticationMethod,
      };
    });
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
        (error) => error.status === '400' && error.code === 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
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
  async submitReassignOidcAuthenticationMethod(oidcAuthenticationMethodCode) {
    await this.args.reassignAuthenticationMethod({
      targetUserId: this.targetUserId,
      identityProvider: oidcAuthenticationMethodCode,
    });
    this.showReassignOidcAuthenticationMethodModal = !this.showReassignOidcAuthenticationMethodModal;
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
  toggleReassignOidcAuthenticationMethodModal(oidcAuthenticationMethod) {
    this.selectedOidcAuthenticationMethod = oidcAuthenticationMethod ? { ...oidcAuthenticationMethod } : null;
    this.showReassignOidcAuthenticationMethodModal = !this.showReassignOidcAuthenticationMethodModal;
  }
}
