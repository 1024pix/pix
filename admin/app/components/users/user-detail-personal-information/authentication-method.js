import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class AuthenticationMethod extends Component {
  @service notifications;
  @service accessControl;

  @tracked showAddAuthenticationMethodModal = false;
  @tracked showReassignGarAuthenticationMethodModal = false;
  @tracked showReassignPoleEmploiAuthenticationMethodModal = false;
  @tracked newEmail = '';
  @tracked targetUserId = '';
  @tracked showAlreadyExistingEmailError = false;

  get hasPixAuthenticationMethod() {
    return this.args.user.authenticationMethods.any(
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

  get hasPoleEmploiAuthenticationMethod() {
    return this.args.user.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'POLE_EMPLOI'
    );
  }

  get hasCnavAuthenticationMethod() {
    return this.args.user.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'CNAV'
    );
  }

  get hasGarAuthenticationMethod() {
    return this.args.user.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR'
    );
  }

  get hasOnlyOneAuthenticationMethod() {
    return (
      [
        this.hasEmailAuthenticationMethod,
        this.hasUsernameAuthenticationMethod,
        this.hasGarAuthenticationMethod,
        this.hasPoleEmploiAuthenticationMethod,
        this.hasCnavAuthenticationMethod,
      ].filter((hasAuthenticationMethod) => hasAuthenticationMethod).length === 1
    );
  }

  get isAllowedToRemoveEmailAuthenticationMethod() {
    return this.hasEmailAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemoveUsernameAuthenticationMethod() {
    return this.hasUsernameAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemovePoleEmploiAuthenticationMethod() {
    return this.hasPoleEmploiAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemoveGarAuthenticationMethod() {
    return this.hasGarAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToRemoveCnavAuthenticationMethod() {
    return this.hasCnavAuthenticationMethod && !this.hasOnlyOneAuthenticationMethod;
  }

  get isAllowedToAddEmailAuthenticationMethod() {
    return !this.hasPixAuthenticationMethod;
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
  toggleReassignPoleEmploiAuthenticationMethodModal() {
    this.showReassignPoleEmploiAuthenticationMethodModal = !this.showReassignPoleEmploiAuthenticationMethodModal;
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
  async submitReassignPoleEmploiAuthenticationMethod(event) {
    event.preventDefault();
    await this.args.reassignAuthenticationMethod({
      targetUserId: this.targetUserId,
      identityProvider: 'POLE_EMPLOI',
    });
    this.showReassignPoleEmploiAuthenticationMethodModal = false;
  }
}
