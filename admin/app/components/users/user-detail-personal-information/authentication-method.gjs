import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

import AddAuthenticationMethodModal from './add-authentication-method-modal';
import ReassignGarAuthenticationMethodModal from './reassign-gar-authentication-method-modal';
import ReassignOidcAuthenticationMethodModal from './reassign-oidc-authentication-method-modal';

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

  <template>
    <header class="page-section__header">
      <h2 class="page-section__title">Méthodes de connexion</h2>
    </header>

    <ul>
      <li class="authentication-method__connexions-information">
        Date de dernière connexion :
        {{#if @user.lastLoggedAt}}{{dayjsFormat @user.lastLoggedAt "DD/MM/YYYY"}}{{/if}}
      </li>
      {{#if @user.emailConfirmedAt}}
        <li class="authentication-method__connexions-information">
          Adresse e-mail confirmée le :
          {{dayjsFormat @user.emailConfirmedAt "DD/MM/YYYY"}}
        </li>
      {{else}}
        <li class="authentication-method__connexions-information">
          Adresse e-mail non confirmée
        </li>
      {{/if}}
    </ul>

    {{#if this.hasPixAuthenticationMethod}}
      <br />
      <ul>
        <li class="authentication-method__connexions-information">
          {{t "components.users.user-detail-personal-information.authentication-method.should-change-password-status"}}
          {{#if this.shouldChangePassword}}{{t "common.words.yes"}}{{else}}{{t "common.words.no"}}{{/if}}
        </li>
      </ul>
    {{/if}}

    <br />

    <table class="authentication-method-table">

      <caption class="authentication-method-table__caption">Méthodes de connexion</caption>

      <tbody>
        <tr>
          <td class="authentication-method-table__name-column">Adresse e-mail</td>
          <td>
            {{#if this.hasEmailAuthenticationMethod}}
              <FaIcon
                @icon="circle-check"
                aria-label="L'utilisateur a une méthode de connexion avec adresse e-mail"
                class="authentication-method-table__check"
              />
            {{else}}
              <FaIcon
                @icon="circle-xmark"
                aria-label="L'utilisateur n'a pas de méthode de connexion avec adresse e-mail"
                class="authentication-method-table__uncheck"
              />
            {{/if}}
          </td>
          <td>
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              {{#if this.isAllowedToRemoveEmailAuthenticationMethod}}
                <PixButton
                  class="user-authentication-method__remove-button"
                  @size="small"
                  @variant="error"
                  @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal "EMAIL"}}
                >Supprimer</PixButton>
              {{/if}}
              {{#if this.isAllowedToAddEmailAuthenticationMethod}}
                <PixButton @triggerAction={{this.toggleAddAuthenticationMethodModal}} @size="small">
                  Ajouter une adresse e-mail
                </PixButton>
              {{/if}}
            {{/if}}
          </td>
        </tr>

        <tr>
          <td class="authentication-method-table__name-column">Identifiant</td>
          <td>
            {{#if this.hasUsernameAuthenticationMethod}}
              <FaIcon
                @icon="circle-check"
                aria-label="L'utilisateur a une méthode de connexion avec identifiant"
                class="authentication-method-table__check"
              />
            {{else}}
              <FaIcon
                @icon="circle-xmark"
                aria-label="L'utilisateur n'a pas de méthode de connexion avec identifiant"
                class="authentication-method-table__uncheck"
              />
            {{/if}}
          </td>
          <td>
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              {{#if this.isAllowedToRemoveUsernameAuthenticationMethod}}
                <PixButton
                  class="user-authentication-method__remove-button"
                  @size="small"
                  @variant="error"
                  @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal "USERNAME"}}
                >Supprimer</PixButton>
              {{/if}}
            {{/if}}
          </td>
        </tr>

        <tr>
          <td class="authentication-method-table__name-column">Médiacentre</td>
          <td>
            {{#if this.hasGarAuthenticationMethod}}
              <FaIcon
                @icon="circle-check"
                aria-label="L'utilisateur a une méthode de connexion Médiacentre"
                class="authentication-method-table__check"
              />
            {{else}}
              <FaIcon
                @icon="circle-xmark"
                aria-label="L'utilisateur n'a pas de méthode de connexion Médiacentre"
                class="authentication-method-table__uncheck"
              />
            {{/if}}
          </td>
          <td class="authentication-method-table__actions-column">
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              <div>
                {{#if this.isAllowedToRemoveGarAuthenticationMethod}}
                  <PixButton
                    @size="small"
                    @variant="error"
                    @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal "GAR"}}
                  >Supprimer</PixButton>
                {{/if}}
                {{#if this.hasGarAuthenticationMethod}}
                  <PixButton @triggerAction={{this.toggleReassignGarAuthenticationMethodModal}} @size="small">
                    Déplacer cette méthode de connexion
                  </PixButton>
                {{/if}}
              </div>
            {{/if}}
          </td>
        </tr>

        {{#each this.userOidcAuthenticationMethods as |userOidcAuthenticationMethod|}}
          <tr>
            <td class="authentication-method-table__name-column">{{userOidcAuthenticationMethod.name}}</td>
            <td>
              {{#if userOidcAuthenticationMethod.userHasThisOidcAuthenticationMethod}}
                <FaIcon
                  @icon="circle-check"
                  aria-label="L'utilisateur a une méthode de connexion {{userOidcAuthenticationMethod.name}}"
                  class="authentication-method-table__check"
                />
              {{else}}
                <FaIcon
                  @icon="circle-xmark"
                  aria-label="L'utilisateur n'a pas de méthode de connexion {{userOidcAuthenticationMethod.name}}"
                  class="authentication-method-table__uncheck"
                />
              {{/if}}
            </td>
            <td class="authentication-method-table__actions-column">
              {{#if this.accessControl.hasAccessToUsersActionsScope}}
                <div>
                  {{#if userOidcAuthenticationMethod.canBeRemovedFromUserAuthenticationMethods}}
                    <PixButton
                      class="user-authentication-method__remove-button"
                      @size="small"
                      @variant="error"
                      @triggerAction={{fn
                        @toggleDisplayRemoveAuthenticationMethodModal
                        userOidcAuthenticationMethod.code
                      }}
                    >Supprimer</PixButton>
                  {{/if}}
                  {{#if userOidcAuthenticationMethod.canBeReassignedToAnotherUser}}
                    <PixButton
                      @triggerAction={{fn
                        this.toggleReassignOidcAuthenticationMethodModal
                        userOidcAuthenticationMethod
                      }}
                      @size="small"
                    >
                      Déplacer cette méthode de connexion
                    </PixButton>
                  {{/if}}
                </div>
              {{/if}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>

    <AddAuthenticationMethodModal
      @onChangeNewEmail={{this.onChangeNewEmail}}
      @showAlreadyExistingEmailError={{this.showAlreadyExistingEmailError}}
      @toggleAddAuthenticationMethodModal={{this.toggleAddAuthenticationMethodModal}}
      @submitAddingPixAuthenticationMethod={{this.submitAddingPixAuthenticationMethod}}
      @isDisplayed={{this.showAddAuthenticationMethodModal}}
    />

    <ReassignGarAuthenticationMethodModal
      @onChangeTargetUserId={{this.onChangeTargetUserId}}
      @toggleReassignGarAuthenticationMethodModal={{this.toggleReassignGarAuthenticationMethodModal}}
      @submitReassignGarAuthenticationMethod={{this.submitReassignGarAuthenticationMethod}}
      @isDisplayed={{this.showReassignGarAuthenticationMethodModal}}
    />

    <ReassignOidcAuthenticationMethodModal
      @oidcAuthenticationMethod={{this.selectedOidcAuthenticationMethod}}
      @onChangeTargetUserId={{this.onChangeTargetUserId}}
      @toggleReassignOidcAuthenticationMethodModal={{this.toggleReassignOidcAuthenticationMethodModal}}
      @submitReassignOidcAuthenticationMethod={{this.submitReassignOidcAuthenticationMethod}}
      @isDisplayed={{this.showReassignOidcAuthenticationMethodModal}}
    />
  </template>
}
