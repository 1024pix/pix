import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
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
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { not } from 'ember-truth-helpers';
import Joi from 'joi';
import CopyButton from 'pix-admin/components/ui/copy-button';
import { DescriptionList } from 'pix-admin/components/ui/description-list';
import ENV from 'pix-admin/config/environment';
import { FormValidator } from 'pix-admin/utils/form-validator';

import ConfirmPopup from '../confirm-popup';

export default class UserOverview extends Component {
  @service accessControl;
  @service intl;
  @service locale;
  @service pixToast;
  @service references;
  @service store;
  @service oidcIdentityProviders;

  @tracked displayAnonymizeModal = false;
  @tracked isEditionMode = false;
  @tracked authenticationMethods = [];
  @tracked form = {};

  validator = null;

  constructor() {
    super(...arguments);
    this.validator = new UserFormValidator(this.args.user);
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
      const today = new Date();
      return today < new Date(userIsTemporaryBlockedUntilDate);
    }
    return false;
  }

  get languageOptions() {
    return this.locale.pixLanguages.map((language) => ({ value: language, label: language }));
  }

  get localeOptions() {
    return this.locale.pixLocales.map((locale) => ({ value: locale, label: locale }));
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
    return this.authenticationMethods.some(
      (authenticationMethod) =>
        oidcProvidersCodes.includes(authenticationMethod.identityProvider) ||
        authenticationMethod.identityProvider === 'GAR',
    );
  }

  _initForm() {
    this.form = {
      firstName: this.args.user.firstName,
      lastName: this.args.user.lastName,
      email: this.args.user.email,
      username: this.args.user.username,
      lang: this.args.user.lang,
      locale: this.args.user.locale,
    };
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

    const isValid = this.validator.validate(this.form);
    if (!isValid) return;

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
    await this.args.user.reload();
    await this.args.user.organizationMemberships?.reload();
    await this.args.user.certificationCenterMemberships?.reload();
    await this.args.user.organizationLearners?.reload();

    this.toggleDisplayAnonymizeModal();
  }

  @action
  async unblockUserAccount() {
    const userLogin = await this.args.user.userLogin;
    await userLogin.save({ adapterOptions: { unblockUserAccount: true, userId: this.args.user.id } });
  }

  @action
  onChangeLanguage(language) {
    this.form = { ...this.form, lang: language };
  }

  @action
  onLocaleChange(locale) {
    this.form = { ...this.form, locale };
  }

  @action
  updateFormValue(key, event) {
    this.form = { ...this.form, [key]: event.target.value };
    this.validator.validateField(key, this.form[key]);
  }

  <template>
    <section class="page-section">
      <div class="user-overview-header">
        <h1 class="page-section__title">Informations de l'utilisateur</h1>
        <PixButtonLink
          @variant="secondary"
          @href={{this.externalURL}}
          @size="small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tableau de bord
        </PixButtonLink>
      </div>

      <div class="user-overview-section">
        {{#if this.isEditionMode}}
          <form class="form" {{on "submit" this.updateUserDetails}}>
            <span class="form__instructions">
              {{t "common.forms.mandatory-fields" htmlSafe=true}}
            </span>
            <div class="form-field">
              <PixInput
                @requiredLabel="obligatoire"
                @errorMessage={{this.validator.errors.firstName}}
                @validationStatus={{if this.validator.errors.firstName "error"}}
                @value={{this.form.firstName}}
                {{on "input" (fn this.updateFormValue "firstName")}}
              ><:label>
                  Prénom
                </:label></PixInput>
            </div>
            <div class="form-field">
              <PixInput
                @requiredLabel="obligatoire"
                @errorMessage={{this.validator.errors.lastName}}
                @validationStatus={{if this.validator.errors.lastName "error"}}
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
                  @errorMessage={{this.validator.errors.email}}
                  @validationStatus={{if this.validator.errors.email "error"}}
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
                  @errorMessage={{this.validator.errors.username}}
                  @validationStatus={{if this.validator.errors.username "error"}}
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
          {{#if @user.hasBeenAnonymised}}
            <PixNotificationAlert @type="warning" class="user-overview-section__anonymisation-message">
              {{this.anonymisationMessage}}
            </PixNotificationAlert>
          {{/if}}

          <DescriptionList aria-label="Informations utilisateur">

            <DescriptionList.Item @label="Prénom">{{@user.firstName}}</DescriptionList.Item>
            <DescriptionList.Item @label="Nom">{{@user.lastName}}</DescriptionList.Item>
            <DescriptionList.Item @label="Langue">{{@user.lang}}</DescriptionList.Item>
            <DescriptionList.Item @label="Locale">{{@user.locale}}</DescriptionList.Item>
            <DescriptionList.Item @label="Date de création">
              {{#if @user.createdAt}}
                {{formatDate @user.createdAt}}
              {{/if}}
            </DescriptionList.Item>

            <DescriptionList.Item @label="Adresse e-mail" @valueClass="user-overview-section__copy-item">
              {{@user.email}}
              <CopyButton
                @id="copy-email"
                @value={{@user.email}}
                @tooltip={{t "components.users.user-detail-personal-information.actions.copy-email"}}
                @label={{t "components.users.user-detail-personal-information.actions.copy-email"}}
              />
            </DescriptionList.Item>
            <DescriptionList.Item @label="Identifiant" @valueClass="user-overview-section__copy-item">
              {{@user.username}}
              <CopyButton
                @id="copy-username"
                @value={{@user.username}}
                @tooltip={{t "components.users.user-detail-personal-information.actions.copy-username"}}
                @label={{t "components.users.user-detail-personal-information.actions.copy-username"}}
              />
            </DescriptionList.Item>
            <DescriptionList.Item @label={{t "components.users.user-overview.sso"}}>
              {{#if this.hasSsoAuthentication}}{{t "common.words.yes"}}{{else}}{{t "common.words.no"}}{{/if}}
            </DescriptionList.Item>

            <DescriptionList.Item @label="Tentatives de connexion en erreur">
              {{if @user.userLogin.failureCount @user.userLogin.failureCount 0}}
            </DescriptionList.Item>
            {{#if @user.userLogin.blockedAt}}
              <DescriptionList.Item @label="Utilisateur totalement bloqué le">
                {{formatDate @user.userLogin.blockedAt format="medium"}}
              </DescriptionList.Item>
            {{/if}}
            {{#if this.shouldDisplayTemporaryBlockedDate}}
              <DescriptionList.Item @label="Utilisateur temporairement bloqué jusqu'au">
                {{formatDate @user.userLogin.temporaryBlockedUntil format="medium"}}
              </DescriptionList.Item>
            {{/if}}
            <DescriptionList.Item @label={{t "components.users.user-overview.global-last-login"}}>
              {{#if @user.lastLoggedAt}}
                {{formatDate @user.lastLoggedAt}}
              {{else}}
                {{t "components.users.user-overview.no-last-connection-date-info"}}
              {{/if}}
            </DescriptionList.Item>

          </DescriptionList>

          {{#if this.accessControl.hasAccessToUsersActionsScope}}
            <div class="user-overview-section__actions">
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
            </div>
          {{/if}}
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

class UserFormValidator extends FormValidator {
  constructor(user) {
    const schema = {
      firstName: Joi.string().min(1).max(255).empty(['', null]).required().messages({
        'any.required': 'Le prénom ne peut pas être vide.',
        'string.empty': 'Le prénom ne peut pas être vide.',
        'string.max': 'La longueur du prénom ne doit pas excéder 255 caractères.',
      }),
      lastName: Joi.string().min(1).max(255).empty(['', null]).required().messages({
        'any.required': 'Le nom ne peut pas être vide.',
        'string.empty': 'Le nom ne peut pas être vide.',
        'string.max': 'La longueur du nom ne doit pas excéder 255 caractères.',
      }),
      lang: Joi.string(),
      locale: Joi.string(),
    };

    if (user.username) {
      // When user has a username, then username require and email is optional
      schema.email = Joi.string().email().max(255).allow(null).empty(['']).optional().messages({
        'string.email': "L'adresse e-mail n'a pas le bon format.",
        'string.max': "La longueur de l'adresse e-mail ne doit pas excéder 255 caractères.",
      });
      schema.username = Joi.string().min(1).max(255).empty(['', null]).required().messages({
        'any.required': "L'identifiant ne peut pas être vide.",
        'string.empty': "L'identifiant ne peut pas être vide.",
        'string.max': "La longueur de l'identifiant ne doit pas excéder 255 caractères.",
      });
    } else if (user.email) {
      // When user has email and does not have username, then only email is required
      schema.email = Joi.string().email().max(255).empty(['', null]).required().messages({
        'any.required': "L'adresse e-mail ne peut pas être vide.",
        'string.empty': "L'adresse e-mail ne peut pas être vide.",
        'string.email': "L'adresse e-mail n'a pas le bon format.",
        'string.max': "La longueur de l'adresse e-mail ne doit pas excéder 255 caractères.",
      });
    }

    super(Joi.object(schema), { allowUnknown: true });
  }
}
