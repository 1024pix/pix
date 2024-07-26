import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
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

  get isManagingStudentAvailable() {
    return (
      !this.args.organization.isLearnerImportEnabled &&
      (this.args.organization.isOrganizationSCO || this.args.organization.isOrganizationSUP)
    );
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

  <template>
    <div class="organization__edit-form">
      <form class="form" {{on "submit" this.updateOrganization}}>

        <span class="form__instructions">
          Les champs marqués de
          <abbr title="obligatoire" class="mandatory-mark" aria-hidden="true">*</abbr>
          sont obligatoires.
        </span>

        <div class="form-field">
          <PixInput
            required={{true}}
            @errorMessage={{this.form.nameError.message}}
            @validationStatus={{this.form.nameError.status}}
            @value={{this.form.name}}
            {{on "input" (fn this.updateFormValue "name")}}
          ><:label>
              <abbr title="obligatoire" class="mandatory-mark" aria-hidden="true">*</abbr>
              Nom
            </:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.externalIdError.message}}
            @validationStatus={{this.form.externalIdError.status}}
            @value={{this.form.externalId}}
            {{on "input" (fn this.updateFormValue "externalId")}}
          ><:label>Identifiant externe</:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.provinceCodeError.message}}
            @validationStatus={{this.form.provinceCodeError.status}}
            @value={{this.form.provinceCode}}
            {{on "input" (fn this.updateFormValue "provinceCode")}}
          ><:label>Département (en 3 chiffres)</:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.dataProtectionOfficerFirstNameError.message}}
            @validationStatus={{this.form.dataProtectionOfficerFirstNameError.status}}
            @value={{this.form.dataProtectionOfficerFirstName}}
            {{on "input" (fn this.updateFormValue "dataProtectionOfficerFirstName")}}
          ><:label>Prénom du DPO</:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.dataProtectionOfficerLastNameError.message}}
            @validationStatus={{this.form.dataProtectionOfficerLastNameError.status}}
            @value={{this.form.dataProtectionOfficerLastName}}
            {{on "input" (fn this.updateFormValue "dataProtectionOfficerLastName")}}
          ><:label>Nom du DPO</:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.dataProtectionOfficerEmailError.message}}
            @validationStatus={{this.form.dataProtectionOfficerEmailError.status}}
            @value={{this.form.dataProtectionOfficerEmail}}
            {{on "input" (fn this.updateFormValue "dataProtectionOfficerEmail")}}
          ><:label>Adresse e-mail du DPO</:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            type="number"
            @errorMessage={{this.form.creditError.message}}
            @validationStatus={{this.form.creditError.status}}
            @value={{this.form.credit}}
            {{on "input" (fn this.updateFormValue "credit")}}
          ><:label>Crédits</:label></PixInput>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.documentationUrlError.message}}
            @validationStatus={{this.form.documentationUrlError.status}}
            @value={{this.form.documentationUrl}}
            {{on "input" (fn this.updateFormValue "documentationUrl")}}
          ><:label>Lien vers la documentation</:label></PixInput>
        </div>

        <div class="form-field">
          <PixCheckbox
            @checked={{this.form.showSkills}}
            {{on "change" (fn this.updateFormCheckBoxValue "showSkills")}}
          ><:label>Affichage des acquis dans l'export de résultats</:label></PixCheckbox>
        </div>

        <div class="form-field">
          <PixSelect
            @options={{this.identityProviderOptions}}
            @value={{this.form.identityProviderForCampaigns}}
            @onChange={{this.onChangeIdentityProvider}}
            @hideDefaultOption={{true}}
          >
            <:label>SSO</:label>
          </PixSelect>
        </div>

        <div class="form-field">
          <PixInput
            @errorMessage={{this.form.emailError.message}}
            @validationStatus={{this.form.emailError.status}}
            @value={{this.form.email}}
            {{on "input" (fn this.updateFormValue "email")}}
          ><:label>Adresse e-mail d'activation SCO</:label></PixInput>
        </div>

        {{#if this.isManagingStudentAvailable}}
          <div class="form-field">
            <PixCheckbox
              @checked={{this.form.isManagingStudents}}
              {{on "change" (fn this.updateFormCheckBoxValue "isManagingStudents")}}
            ><:label>Gestion d’élèves/étudiants</:label></PixCheckbox>
          </div>
        {{/if}}

        <div class="form-field">
          <PixCheckbox
            @id="isMultipleSendingAssessmentEnabled"
            @checked={{this.form.isMultipleSendingAssessmentEnabled}}
            {{on "change" (fn this.updateFormCheckBoxValue "isMultipleSendingAssessmentEnabled")}}
          >
            <:label>Activer l'envoi multiple pour les campagnes de type évaluation</:label>
          </PixCheckbox>
        </div>
        <div class="form-field">
          <PixCheckbox
            @id="isPlacesManagementEnabled"
            @checked={{this.form.isPlacesManagementEnabled}}
            {{on "change" (fn this.updateFormCheckBoxValue "isPlacesManagementEnabled")}}
          >
            <:label>Activer la page Places sur PixOrga</:label>
          </PixCheckbox>
        </div>
        <div class="form-actions">
          <PixButton @size="small" @variant="secondary" @triggerAction={{this.closeAndResetForm}}>Annuler</PixButton>
          <PixButton @type="submit" @size="small" @variant="success">Enregistrer</PixButton>
        </div>
      </form>
    </div>
  </template>
}
