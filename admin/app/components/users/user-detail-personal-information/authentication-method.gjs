import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

import AddAuthenticationMethodModal from './add-authentication-method-modal';
import ReassignGarAuthenticationMethodModal from './reassign-gar-authentication-method-modal';
import ReassignOidcAuthenticationMethodModal from './reassign-oidc-authentication-method-modal';

export default class AuthenticationMethod extends Component {
  @service pixToast;
  @service accessControl;
  @service intl;
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

  get emailAuthenticationMethod() {
    return { code: 'EMAIL', name: 'Adresse e-mail' };
  }

  get userNameAuthenticationMethod() {
    return { code: 'USERNAME', name: 'Identifiant' };
  }

  get garAuthenticationMethod() {
    return { code: 'GAR', name: 'Médiacentre' };
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

  get pixLastLoggedAtAuthenticationMethod() {
    const method = this.authenticationMethods.find((method) => method.identityProvider === 'PIX');
    return method ? this._displayAuthenticationMethodDate(method.lastLoggedAt) : null;
  }

  get garLastLoggedAtAuthenticationMethod() {
    const method = this.authenticationMethods.find((method) => method.identityProvider === 'GAR');
    return method ? this._displayAuthenticationMethodDate(method.lastLoggedAt) : null;
  }

  _displayAuthenticationMethodDate(date) {
    if (!date)
      return this.intl.t(
        'components.users.user-detail-personal-information.authentication-method.no-last-connection-date-info',
      );
    return this.intl.t('components.users.user-detail-personal-information.authentication-method.last-logged-at', {
      date: dayjs(date).format('DD/MM/YYYY'),
    });
  }

  @action
  oidcLastLoggedAtAuthenticationMethod(oidc) {
    const method = this.authenticationMethods.find((method) => method.identityProvider === oidc.code);
    return method ? this._displayAuthenticationMethodDate(method.lastLoggedAt) : null;
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
      this.pixToast.sendSuccessNotification({
        message: `${this.newEmail} a bien été rajouté aux méthodes de connexion de l'utilisateur`,
      });
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
        this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue, veuillez réessayer.' });
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

    <ul class="authentication-method__connexions-information">
      {{#if @user.emailConfirmedAt}}
        <li>
          <strong>Adresse e-mail confirmée le :</strong>
          {{dayjsFormat @user.emailConfirmedAt "DD/MM/YYYY"}}
        </li>
      {{else}}
        <li>
          <strong>Adresse e-mail non confirmée</strong>
        </li>
      {{/if}}
      {{#if this.hasPixAuthenticationMethod}}
        <li>
          <strong>{{t
              "components.users.user-detail-personal-information.authentication-method.should-change-password-status"
            }}</strong>
          {{#if this.shouldChangePassword}}{{t "common.words.yes"}}{{else}}{{t "common.words.no"}}{{/if}}
        </li>
      {{/if}}

      {{#each @user.orderedLastApplicationConnections as |orderedLastApplicationConnection|}}
        <li>
          {{t
            "components.users.user-detail-personal-information.authentication-method.last-application-connection-date"
          }}
          {{orderedLastApplicationConnection.label}}
          :
          {{#if orderedLastApplicationConnection.lastLoggedAt}}
            {{dayjsFormat orderedLastApplicationConnection.lastLoggedAt "DD/MM/YYYY"}}
          {{/if}}
        </li>
      {{/each}}
    </ul>

    <table class="authentication-method-table">

      <caption class="authentication-method-table__caption">Méthodes de connexion</caption>

      <tbody>
        <tr>
          <td class="authentication-method-table__name-column">Adresse e-mail</td>
          <td>
            {{#if this.hasEmailAuthenticationMethod}}
              <PixIcon
                @name="checkCircle"
                @plainIcon={{true}}
                @ariaHidden={{false}}
                aria-label="L'utilisateur a une méthode de connexion avec adresse e-mail"
                class="authentication-method-table__check"
              />

            {{else}}
              <PixIcon
                @name="cancel"
                @plainIcon={{true}}
                @ariaHidden={{false}}
                aria-label="L'utilisateur n'a pas de méthode de connexion avec adresse e-mail"
                class="authentication-method-table__uncheck"
              />
            {{/if}}
          </td>
          <td>{{this.pixLastLoggedAtAuthenticationMethod}}</td>
          <td>
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              {{#if this.isAllowedToRemoveEmailAuthenticationMethod}}
                <PixButton
                  class="user-authentication-method__remove-button"
                  @size="small"
                  @variant="error"
                  @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal this.emailAuthenticationMethod}}
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
              <PixIcon
                @name="checkCircle"
                @plainIcon={{true}}
                @ariaHidden={{false}}
                aria-label="L'utilisateur a une méthode de connexion avec identifiant"
                class="authentication-method-table__check"
              />
            {{else}}
              <PixIcon
                @name="cancel"
                @plainIcon={{true}}
                @ariaHidden={{false}}
                aria-label="L'utilisateur n'a pas de méthode de connexion avec identifiant"
                class="authentication-method-table__uncheck"
              />
            {{/if}}
          </td>
          <td>{{this.pixLastLoggedAtAuthenticationMethod}}</td>
          <td>
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              {{#if this.isAllowedToRemoveUsernameAuthenticationMethod}}
                <PixButton
                  class="user-authentication-method__remove-button"
                  @size="small"
                  @variant="error"
                  @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal this.userNameAuthenticationMethod}}
                >Supprimer</PixButton>
              {{/if}}
            {{/if}}
          </td>
        </tr>

        <tr>
          <td class="authentication-method-table__name-column">Médiacentre</td>
          <td>
            {{#if this.hasGarAuthenticationMethod}}
              <PixIcon
                @name="checkCircle"
                @plainIcon={{true}}
                @ariaHidden={{false}}
                aria-label="L'utilisateur a une méthode de connexion Médiacentre"
                class="authentication-method-table__check"
              />
            {{else}}
              <PixIcon
                @name="cancel"
                @plainIcon={{true}}
                @ariaHidden={{false}}
                aria-label="L'utilisateur n'a pas de méthode de connexion Médiacentre"
                class="authentication-method-table__uncheck"
              />
            {{/if}}
          </td>
          <td>{{this.garLastLoggedAtAuthenticationMethod}}</td>
          <td class="authentication-method-table__actions-column">
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              <div>
                {{#if this.isAllowedToRemoveGarAuthenticationMethod}}
                  <PixButton
                    @size="small"
                    @variant="error"
                    @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal this.garAuthenticationMethod}}
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
                <PixIcon
                  @name="checkCircle"
                  @plainIcon={{true}}
                  @ariaHidden={{false}}
                  aria-label="L'utilisateur a une méthode de connexion {{userOidcAuthenticationMethod.name}}"
                  class="authentication-method-table__check"
                />
              {{else}}
                <PixIcon
                  @name="cancel"
                  @plainIcon={{true}}
                  @ariaHidden={{false}}
                  aria-label="L'utilisateur n'a pas de méthode de connexion {{userOidcAuthenticationMethod.name}}"
                  class="authentication-method-table__uncheck"
                />
              {{/if}}
            </td>
            <td>{{this.oidcLastLoggedAtAuthenticationMethod userOidcAuthenticationMethod}}</td>
            <td class="authentication-method-table__actions-column">
              {{#if this.accessControl.hasAccessToUsersActionsScope}}
                <div>
                  {{#if userOidcAuthenticationMethod.canBeRemovedFromUserAuthenticationMethods}}
                    <PixButton
                      class="user-authentication-method__remove-button"
                      @size="small"
                      @variant="error"
                      @triggerAction={{fn @toggleDisplayRemoveAuthenticationMethodModal userOidcAuthenticationMethod}}
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
