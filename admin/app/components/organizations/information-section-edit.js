import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationInformationSectionEditionMode extends Component {
  @service accessControl;
  @service store;
  @service oidcIdentityProviders;

  @tracked isEditMode = false;
  @tracked showArchivingConfirmationModal = false;
  noIdentityProviderOption = { label: 'Aucun', value: 'None' };
  garIdentityProviderOption = { label: 'GAR', value: 'GAR' };

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('organization-form');
    this._initForm();
  }

  get identityProviderOptions() {
    const oidcIdentityProvidersOptions = this.oidcIdentityProviders.list.map((identityProvider) => ({
      value: identityProvider.code,
      label: identityProvider.organizationName,
    }));
    return [this.noIdentityProviderOption, this.garIdentityProviderOption, ...oidcIdentityProvidersOptions];
  }

  @action
  onChangeIdentityProvider(newIdentityProvider) {
    this.form.identityProviderForCampaigns = newIdentityProvider;
  }

  @action
  closeAndResetForm() {
    this.args.toggleEditMode();
    this._initForm();
  }

  @action
  updateFormCheckBoxValue(key) {
    this.form[key] = !this.form[key];
  }

  @action
  updateFormValue(key, event) {
    this.form[key] = event.target.value;
  }

  @action
  async updateOrganization(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }

    if (this.form.identityProviderForCampaigns === 'None') {
      this.form.identityProviderForCampaigns = null;
    }

    this.args.organization.set('name', this.form.name);
    this.args.organization.set('externalId', this.form.externalId);
    this.args.organization.set('provinceCode', this.form.provinceCode);
    this.args.organization.set('dataProtectionOfficerFirstName', this.form.dataProtectionOfficerFirstName);
    this.args.organization.set('dataProtectionOfficerLastName', this.form.dataProtectionOfficerLastName);
    this.args.organization.set('dataProtectionOfficerEmail', this.form.dataProtectionOfficerEmail);
    this.args.organization.set('email', this.form.email);
    this.args.organization.set('credit', this.form.credit);
    this.args.organization.set('isManagingStudents', this.form.isManagingStudents);
    this.args.organization.set('documentationUrl', this.form.documentationUrl);
    this.args.organization.set('showSkills', this.form.showSkills);
    this.args.organization.set('identityProviderForCampaigns', this.form.identityProviderForCampaigns);
    this.args.organization.set('isMultipleSendingAssessmentEnabled', this.form.isMultipleSendingAssessmentEnabled);
    this.args.organization.set('isPlacesManagementEnabled', this.form.isPlacesManagementEnabled);

    this.closeAndResetForm();
    return this.args.onSubmit();
  }

  _initForm() {
    this.form.name = this.args.organization.name;
    this.form.externalId = this.args.organization.externalId;
    this.form.provinceCode = this.args.organization.provinceCode;
    this.form.dataProtectionOfficerFirstName = this.args.organization.dataProtectionOfficerFirstName;
    this.form.dataProtectionOfficerLastName = this.args.organization.dataProtectionOfficerLastName;
    this.form.dataProtectionOfficerEmail = this.args.organization.dataProtectionOfficerEmail;
    this.form.email = this.args.organization.email;
    this.form.credit = this.args.organization.credit;
    this.form.isManagingStudents = this.args.organization.isManagingStudents;
    this.form.documentationUrl = this.args.organization.documentationUrl;
    this.form.showSkills = this.args.organization.showSkills;
    this.form.isMultipleSendingAssessmentEnabled = this.args.organization.isMultipleSendingAssessmentEnabled;
    this.form.isPlacesManagementEnabled = this.args.organization.isPlacesManagementEnabled;
    this.form.identityProviderForCampaigns =
      this.args.organization.identityProviderForCampaigns ?? this.noIdentityProviderOption.value;
  }
}
