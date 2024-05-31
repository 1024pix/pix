import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import ENV from 'pix-admin/config/environment';

export default class UserOverview extends Component {
  @service accessControl;
  @service intl;
  @service notifications;
  @service references;
  @service store;

  @tracked displayAnonymizeModal = false;
  @tracked isEditionMode = false;

  languages = this.references.availableLanguages;
  locales = this.references.availableLocales;
  tooltipTextEmail = this.intl.t('components.users.user-detail-personal-information.actions.copy-email');
  tooltipTextUsername = this.intl.t('components.users.user-detail-personal-information.actions.copy-username');

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('user-form');
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.USER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.user.id;
  }

  get anonymisationMessage() {
    return this.args.user.anonymisedByFullName
      ? `Utilisateur anonymisé par ${this.args.user.anonymisedByFullName}.`
      : 'Utilisateur anonymisé.';
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

  get userHasValidatePixAppTermsOfService() {
    return this._formatValidatedTermsOfServiceText(this.args.user.lastTermsOfServiceValidatedAt, this.args.user.cgu);
  }

  get userHasValidatePixOrgaTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.user.lastPixOrgaTermsOfServiceValidatedAt,
      this.args.user.pixOrgaTermsOfServiceAccepted,
    );
  }

  get userHasValidatePixCertifTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.user.lastPixCertifTermsOfServiceValidatedAt,
      this.args.user.pixCertifTermsOfServiceAccepted,
    );
  }

  get languageOptions() {
    return this.languages;
  }

  get localeOptions() {
    return this.locales;
  }

  _formatValidatedTermsOfServiceText(date, hasValidatedTermsOfService) {
    const formattedDateText = date ? `, le ${dayjs(date).format('DD/MM/YYYY')}` : '';
    return hasValidatedTermsOfService ? `OUI${formattedDateText}` : 'NON';
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
      this.notifications.success('L’utilisateur a été mis à jour avec succès.');
      this.isEditionMode = false;
    } catch (response) {
      this.args.user.rollbackAttributes();
      const messageValidationError =
        response.errors[0].detail || "une erreur est survenue, vos modifications n'ont pas été enregistrées";
      this.notifications.error(messageValidationError);
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
}
