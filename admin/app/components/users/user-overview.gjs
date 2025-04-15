import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import CopyButton from 'ember-cli-clipboard/components/copy-button';
import isClipboardSupported from 'ember-cli-clipboard/helpers/is-clipboard-supported';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';
import ENV from 'pix-admin/config/environment';

import ConfirmPopup from '../confirm-popup';

export default class UserOverview extends Component {
  @service accessControl;
  @service intl;
  @service pixToast;
  @service references;
  @service store;
  @service oidcIdentityProviders;

  @tracked displayAnonymizeModal = false;
  @tracked isEditionMode = false;
  @tracked authenticationMethods = [];

  languages = this.references.availableLanguages;
  locales = this.references.availableLocales;
  tooltipTextEmail = this.intl.t('components.users.user-detail-personal-information.actions.copy-email');
  tooltipTextUsername = this.intl.t('components.users.user-detail-personal-information.actions.copy-username');

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('user-form');
    Promise.resolve(this.args.user.authenticationMethods).then((authenticationMethods) => {
      this.authenticationMethods = authenticationMethods;
    });
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.USER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.user.id;
  }

  get anonymisationMessage() {
    if (this.args.user.id === String(this.args.user.hasBeenAnonymisedBy)) {
      return this.intl.t('pages.user-details.overview.anonymisation.self-anonymisation-message');
    }
    if (this.args.user.anonymisedByFullName) {
      const fullName = this.args.user.anonymisedByFullName;
      return this.intl.t('pages.user-details.overview.anonymisation.user-anonymised-by-admin-message', { fullName });
    }
    return this.intl.t('pages.user-details.overview.anonymisation.default-anonymised-user-message');
  }

  get canModifyEmail() {
    return !!(this.args.user.email || this.args.user.username);
  }

  get shouldDisplayTemporaryBlockedDate() {
    const userIsTemporaryBlockedUntilDate = this.args.user?.userLogin?.get('temporaryBlockedUntil');
    if (userIsTemporaryBlockedUntilDate) {
      return dayjs().isBefore(dayjs(userIsTemporaryBlockedUntilDate));
    }
    return false;
  }

  get languageOptions() {
    return this.languages;
  }

  get localeOptions() {
    return this.locales;
  }

  get isAnonymizationDisabled() {
    const { hasBeenAnonymised, isPixAgent } = this.args.user;
    return hasBeenAnonymised || isPixAgent;
  }

  get isEmailRequired() {
    return this.args.user.username ? null : 'obligatoire';
  }

  get hasSsoAuthentication() {
    const oidcProvidersCodes = this.oidcIdentityProviders.list.map((provider) => provider.code);
    return this.authenticationMethods.any(
      (authenticationMethod) =>
        oidcProvidersCodes.includes(authenticationMethod.identityProvider) ||
        authenticationMethod.identityProvider === 'GAR',
    );
  }

  _initForm() {
    this.form.firstName = this.args.user.firstName;
    this.form.lastName = this.args.user.lastName;
    this.form.email = this.args.user.email;
    this.form.username = this.args.user.username;
    this.form.lang = this.args.user.lang;
    this.form.locale = this.args.user.locale;
  }

  @action
  changeEditionMode(event) {
    event.preventDefault();
    this._initForm();
    this.isEditionMode = !this.isEditionMode;
  }

  @action
  cancelEdit() {
    this._initForm();
    this.isEditionMode = false;
  }

  @action
  async updateUserDetails(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }
    this.args.user.firstName = this.form.firstName.trim();
    this.args.user.lastName = this.form.lastName.trim();
    this.args.user.email = !this.form.email ? null : this.form.email.trim();
    this.args.user.username = !this.form.username ? null : this.form.username.trim();
    this.args.user.lang = this.form.lang;
    this.args.user.locale = this.form.locale;

    try {
      await this.args.user.save();
      this.pixToast.sendSuccessNotification({ message: 'L’utilisateur a été mis à jour avec succès.' });
      this.isEditionMode = false;
    } catch (response) {
      this.args.user.rollbackAttributes();
      const messageValidationError =
        response.errors[0].detail || "une erreur est survenue, vos modifications n'ont pas été enregistrées";
      this.pixToast.sendErrorNotification({ message: messageValidationError });
    }
  }

  @action
  toggleDisplayAnonymizeModal() {
    this.displayAnonymizeModal = !this.displayAnonymizeModal;
  }

  @action
  async anonymizeUser() {
    await this.args.user.save({ adapterOptions: { anonymizeUser: true } });
    this.args.user.organizationMemberships = [];
    this.args.user.certificationCenterMemberships = [];
    this.args.user.organizationLearners = [];

    this.toggleDisplayAnonymizeModal();
  }

  @action
  async unblockUserAccount() {
    const userLogin = await this.args.user.userLogin;
    await userLogin.save({ adapterOptions: { unblockUserAccount: true, userId: this.args.user.id } });
  }

  @action
  onChangeLanguage(language) {
    this.form.lang = language;
  }

  @action
  onLocaleChange(locale) {
    this.form.locale = locale;
  }

  @action
  updateFormValue(key, event) {
    this.form[key] = event.target.value;
  }

  <template>
    <section class="page-section">
      <div class="user-detail-personal-information-section">
        {{#if this.isEditionMode}}
          <form class="form" {{on "submit" this.updateUserDetails}}>
            <span class="form__instructions">
              {{t "common.forms.mandatory-fields" htmlSafe=true}}
            </span>
            <div class="form-field">
              <PixInput
                @requiredLabel="obligatoire"
                @errorMessage={{this.form.firstNameError.message}}
                @validationStatus={{this.form.firstNameError.status}}
                @value={{this.form.firstName}}
                {{on "input" (fn this.updateFormValue "firstName")}}
              ><:label>
                  Prénom
                </:label></PixInput>
            </div>
            <div class="form-field">
              <PixInput
                @requiredLabel="obligatoire"
                @errorMessage={{this.form.lastNameError.message}}
                @validationStatus={{this.form.lastNameError.status}}
                @value={{this.form.lastName}}
                {{on "input" (fn this.updateFormValue "lastName")}}
              >
                <:label>
                  Nom
                </:label></PixInput>
            </div>
            {{#if this.canModifyEmail}}
              <div class="form-field">
                <PixInput
                  @requiredLabel={{this.isEmailRequired}}
                  @errorMessage={{this.form.emailError.message}}
                  @validationStatus={{this.form.emailError.status}}
                  @value={{this.form.email}}
                  {{on "input" (fn this.updateFormValue "email")}}
                >
                  <:label>
                    Adresse e-mail
                  </:label></PixInput>
              </div>
            {{/if}}
            {{#if @user.username}}
              <div class="form-field">
                <PixInput
                  @requiredLabel="obligatoire"
                  @errorMessage={{this.form.usernameError.message}}
                  @validationStatus={{this.form.usernameError.status}}
                  @value={{this.form.username}}
                  {{on "input" (fn this.updateFormValue "username")}}
                ><:label>
                    Identifiant
                  </:label></PixInput>
              </div>
            {{/if}}
            <div class="form-field">
              <PixSelect
                @placeholder="-- Sélectionnez une langue --"
                @options={{this.languageOptions}}
                @value={{this.form.lang}}
                @onChange={{this.onChangeLanguage}}
                @hideDefaultOption={{true}}
              >
                <:label>Langue</:label>
              </PixSelect>
            </div>
            <div class="form-field">
              <PixSelect
                @placeholder="-- Sélectionnez une locale --"
                @options={{this.localeOptions}}
                @value={{this.form.locale}}
                @onChange={{this.onLocaleChange}}
                @hideDefaultOption={{true}}
              >
                <:label>Locale</:label>
              </PixSelect>
            </div>
            <div class="form-actions">
              <PixButton @size="small" @variant="secondary" @triggerAction={{this.cancelEdit}}>
                {{t "common.actions.cancel"}}
              </PixButton>
              <PixButton @type="submit" @size="small" @variant="success">{{t "common.actions.edit"}}</PixButton>
            </div>
          </form>
        {{else}}
          <div>
            {{#if @user.hasBeenAnonymised}}
              <PixNotificationAlert
                @type="warning"
                class="user-detail-personal-information-section__anonymisation-message"
              >
                {{this.anonymisationMessage}}
              </PixNotificationAlert>
            {{/if}}
          </div>
          <div class="user-detail-personal-information-section__content">
            <div>
              <ul class="user-detail-personal-information-section__infogroup">
                <li class="user-detail-personal-information-section__user-informations">Prénom :
                  {{@user.firstName}}</li>
                <li class="user-detail-personal-information-section__user-informations">Nom : {{@user.lastName}}</li>
                <li class="user-detail-personal-information-section__user-informations">Langue : {{@user.lang}}</li>
                <li class="user-detail-personal-information-section__user-informations">Locale : {{@user.locale}}</li>
                <li class="user-detail-personal-information-section__user-informations">
                  Date de création :
                  {{#if @user.createdAt}}
                    {{dayjsFormat @user.createdAt "DD/MM/YYYY"}}
                  {{/if}}
                </li>
              </ul>
              <ul class="user-detail-personal-information-section__infogroup">
                <li class="user-detail-personal-information-section__user-informations flex space-between gap-4x">
                  <span>Adresse e-mail : {{@user.email}}</span>
                  <span>
                    {{#if @user.email}}
                      {{#if (isClipboardSupported)}}
                        <PixTooltip @id="copy-email-tooltip" @position="top" @isInline={{true}}>
                          <:triggerElement>
                            <CopyButton
                              @text={{@user.email}}
                              aria-label="{{t 'components.users.user-detail-personal-information.actions.copy-email'}}"
                              aria-describedby="copy-user-email"
                              class="pix-icon-button pix-icon-button--small pix-icon-button--dark-grey"
                            >
                              <PixIcon @name="copy" @ariaHidden={{true}} />
                            </CopyButton>
                          </:triggerElement>
                          <:tooltip>{{this.tooltipTextEmail}}</:tooltip>
                        </PixTooltip>
                      {{/if}}
                    {{/if}}
                  </span>
                </li>
                <li class="user-detail-personal-information-section__user-informations flex space-between gap-4x">
                  <span>Identifiant : {{@user.username}}</span>
                  <span>
                    {{#if @user.username}}
                      {{#if (isClipboardSupported)}}
                        <PixTooltip @id="copy-username-tooltip" @position="top" @isInline={{true}}>
                          <:triggerElement>
                            <CopyButton
                              @text={{@user.username}}
                              aria-label="{{t
                                'components.users.user-detail-personal-information.actions.copy-username'
                              }}"
                              aria-describedby="copy-user-id"
                              class="pix-icon-button pix-icon-button--small pix-icon-button--dark-grey"
                            >
                              <PixIcon @name="copy" @ariaHidden={{true}} />
                            </CopyButton>
                          </:triggerElement>
                          <:tooltip>{{this.tooltipTextUsername}}</:tooltip>
                        </PixTooltip>
                      {{/if}}
                    {{/if}}
                  </span>
                </li>
                <li class="user-detail-personal-information-section__user-informations flex space-between gap-4x">
                  <span>
                    {{t "components.users.user-overview.sso"}}
                    :
                    {{#if this.hasSsoAuthentication}}{{t "common.words.yes"}}{{else}}{{t "common.words.no"}}{{/if}}
                  </span>
                </li>
              </ul>

              <ul class="user-detail-personal-information-section__infogroup">
                <li class="user-detail-personal-information-section__user-informations">Nombre de tentatives de
                  connexion en erreur :
                  {{@user.userLogin.failureCount}}</li>
                {{#if @user.userLogin.blockedAt}}
                  <li class="user-detail-personal-information-section__user-informations">Utilisateur totalement bloqué
                    le :
                    {{dayjsFormat @user.userLogin.blockedAt "DD/MM/YYYY HH:mm"}}</li>
                {{/if}}
                {{#if this.shouldDisplayTemporaryBlockedDate}}
                  <li class="user-detail-personal-information-section__user-informations">Utilisateur temporairement
                    bloqué jusqu'au :
                    {{dayjsFormat @user.userLogin.temporaryBlockedUntil "DD/MM/YYYY HH:mm"}}</li>
                {{/if}}
                <li>
                  {{t "components.users.user-overview.global-last-login"}}
                  {{#if @user.lastLoggedAt}}
                    {{dayjsFormat @user.lastLoggedAt "DD/MM/YYYY"}}
                  {{else}}
                    {{t "components.users.user-overview.no-last-connection-date-info"}}
                  {{/if}}
                </li>
              </ul>
            </div>
            <div>
              <PixButtonLink
                @variant="secondary"
                @href={{this.externalURL}}
                @size="small"
                target="_blank"
                rel="noopener noreferrer"
              >Tableau de bord</PixButtonLink>
            </div>
          </div>
          <div class="form-actions">
            {{#if this.accessControl.hasAccessToUsersActionsScope}}
              <PixButton
                @size="small"
                @variant="secondary"
                @triggerAction={{this.changeEditionMode}}
                @isDisabled={{@user.hasBeenAnonymised}}
              >
                {{t "common.actions.edit"}}
              </PixButton>

              <PixTooltip @position="bottom" @hide={{not @user.isPixAgent}} @isInline="{{true}}">
                <:triggerElement>
                  <PixButton
                    @size="small"
                    @variant="error"
                    @triggerAction={{this.toggleDisplayAnonymizeModal}}
                    @isDisabled={{this.isAnonymizationDisabled}}
                  >
                    Anonymiser cet utilisateur
                  </PixButton>
                </:triggerElement>
                <:tooltip>Vous ne pouvez pas anonymiser le compte d'un agent Pix.</:tooltip>
              </PixTooltip>

              {{#if @user.userLogin.blockedAt}}
                <PixButton @variant="primary-bis" @triggerAction={{this.unblockUserAccount}} @size="small">
                  Débloquer l'utilisateur
                </PixButton>
              {{/if}}
            {{/if}}
          </div>
        {{/if}}
      </div>
    </section>

    <ConfirmPopup
      @message="Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible."
      @confirm={{this.anonymizeUser}}
      @cancel={{this.toggleDisplayAnonymizeModal}}
      @submitButtonType="danger"
      @show={{this.displayAnonymizeModal}}
    />
  </template>
}
