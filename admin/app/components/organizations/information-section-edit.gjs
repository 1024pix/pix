import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import { FormValidator } from 'pix-admin/utils/form-validator';

import Card from '../card';

export default class OrganizationInformationSectionEditionMode extends Component {
  @service store;
  @service oidcIdentityProviders;
  @service intl;
  @service locale;
  @service pixToast;

  @tracked isEditMode = false;
  @tracked form = {};
  @tracked showArchivingConfirmationModal = false;
  @tracked administrationTeams = [];
  @tracked organizationLearnerTypes = [];
  @tracked countries = [];

  noIdentityProviderOption = { label: this.intl.t('common.words.none'), value: 'None' };
  garIdentityProviderOption = { label: 'GAR', value: 'GAR' };

  validator = new FormValidator(ORGANIZATION_FORM_VALIDATION_SCHEMA, { allowUnknown: true });

  constructor() {
    super(...arguments);
    this.#initForm();
    this.#loadAsyncData();
  }

  async #loadAsyncData() {
    this.administrationTeams = await this.store.findAll('administration-team');
    this.organizationLearnerTypes = await this.store.findAll('organization-learner-type');
    this.countries = await this.store.findAll('country');
  }

  #initForm() {
    this.form = {
      name: this.args.organization.name,
      externalId: this.args.organization.externalId,
      provinceCode: this.args.organization.provinceCode,
      dataProtectionOfficerFirstName: this.args.organization.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this.args.organization.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this.args.organization.dataProtectionOfficerEmail,
      email: this.args.organization.email,
      credit: this.args.organization.credit,
      documentationUrl: this.args.organization.documentationUrl,
      identityProviderForCampaigns:
        this.args.organization.identityProviderForCampaigns ?? this.noIdentityProviderOption.value,
      administrationTeamId: this.args.organization.administrationTeamId
        ? `${this.args.organization.administrationTeamId}`
        : null,
      countryCode: this.args.organization.countryCode ? `${this.args.organization.countryCode}` : null,
      organizationLearnerTypeId: this.args.organization.organizationLearnerTypeId
        ? `${this.args.organization.organizationLearnerTypeId}`
        : null,
    };
  }

  get identityProviderOptions() {
    const oidcIdentityProvidersOptions = this.oidcIdentityProviders.identityProvidersForPixApp.map(
      (identityProvider) => ({
        value: identityProvider.code,
        label: identityProvider.contextualizedName,
      }),
    );
    return [this.noIdentityProviderOption, this.garIdentityProviderOption, ...oidcIdentityProvidersOptions];
  }

  get administrationTeamsOptions() {
    const options = this.administrationTeams.map((administrationTeam) => ({
      value: administrationTeam.id,
      label: administrationTeam.name,
    }));

    return options;
  }

  get organizationLearnerTypeOptions() {
    const options = this.organizationLearnerTypes.map((organizationLearnerType) => ({
      value: organizationLearnerType.id,
      label: organizationLearnerType.name,
    }));
    return options;
  }

  get countriesOptions() {
    const options = this.countries.map((country) => ({
      value: country.code,
      label: `${country.name} (${country.code})`,
    }));

    return options;
  }

  get dpoSectionTitle() {
    return `${this.intl.t('components.organizations.creation.dpo.definition')} (${this.intl.t('components.organizations.creation.dpo.acronym')})`;
  }

  @action
  closeAndResetForm() {
    this.args.toggleEditMode();
    this.#initForm();
  }

  @action
  updateFormValue(key, event) {
    this.updateValue(key, event.target.value);
  }

  @action
  updateValue(key, value) {
    this.form = lodashSet(this.form, key, value);
    if (key.includes('.')) return;
    this.validator.validateField(key, lodashGet(this.form, key));
  }

  @action
  async updateOrganization(event) {
    event.preventDefault();

    const isValid = await this.validator.validate(this.form);
    if (!isValid) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.organizations.editing.required-fields-error'),
      });
      return;
    }

    if (this.form.identityProviderForCampaigns === 'None') {
      this.form.identityProviderForCampaigns = null;
    }

    const administrationTeamName = this.administrationTeams.find(
      (team) => team.id === this.form.administrationTeamId,
    )?.name;

    const organizationLearnerTypeName = this.organizationLearnerTypes.find(
      (organizationLearnerType) => organizationLearnerType.id === this.form.organizationLearnerTypeId,
    )?.name;

    const countryName = this.countries.find((country) => country.code === this.form.countryCode)?.name;

    this.args.organization.set('name', this.form.name);
    this.args.organization.set('externalId', this.form.externalId);
    this.args.organization.set('provinceCode', this.form.provinceCode);
    this.args.organization.set('dataProtectionOfficerFirstName', this.form.dataProtectionOfficerFirstName);
    this.args.organization.set('dataProtectionOfficerLastName', this.form.dataProtectionOfficerLastName);
    this.args.organization.set('dataProtectionOfficerEmail', this.form.dataProtectionOfficerEmail);
    this.args.organization.set('email', this.form.email);
    this.args.organization.set('credit', this.form.credit);
    this.args.organization.set('documentationUrl', this.form.documentationUrl);
    this.args.organization.set('identityProviderForCampaigns', this.form.identityProviderForCampaigns);
    this.args.organization.set('administrationTeamId', this.form.administrationTeamId);
    this.args.organization.set('administrationTeamName', administrationTeamName);
    this.args.organization.set('countryCode', this.form.countryCode);
    this.args.organization.set('countryName', countryName ?? null);
    this.args.organization.set('organizationLearnerTypeId', this.form.organizationLearnerTypeId);
    this.args.organization.set('organizationLearnerTypeName', organizationLearnerTypeName);

    this.closeAndResetForm();
    return this.args.onSubmit();
  }

  <template>
    <form class="admin-form" {{on "submit" this.updateOrganization}}>
      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>
      <section class="admin-form__content organization-creation-form">
        <Card
          class="admin-form__card organization-creation-form__card"
          @title={{t "common.cards.titles.general-information"}}
        >
          <div class="organization-creation-form__input--full">
            <PixInput
              required={{true}}
              @requiredLabel={{t "common.forms.mandatory"}}
              @errorMessage={{this.validator.errors.name}}
              @validationStatus={{if this.validator.errors.name "error"}}
              @value={{this.form.name}}
              @isFullWidth={{true}}
              {{on "input" (fn this.updateFormValue "name")}}
            ><:label>
                {{t "components.organizations.editing.name.label"}}
              </:label></PixInput>
          </div>

          <PixSelect
            required
            @aria-required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{if
              this.validator.errors.administrationTeamId
              (t this.validator.errors.administrationTeamId)
            }}
            @validationStatus={{if this.validator.errors.administrationTeamId "error"}}
            @options={{this.administrationTeamsOptions}}
            @value={{this.form.administrationTeamId}}
            @onChange={{fn this.updateValue "administrationTeamId"}}
            @hideDefaultOption={{true}}
            @placeholder={{t "components.organizations.editing.administration-team.selector.placeholder"}}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.editing.administration-team.selector.label"}}</:label>
          </PixSelect>

          <PixSelect
            required
            @aria-required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{if
              this.validator.errors.organizationLearnerTypeId
              (t this.validator.errors.organizationLearnerTypeId)
            }}
            @validationStatus={{if this.validator.errors.organizationLearnerTypeId "error"}}
            @options={{this.organizationLearnerTypeOptions}}
            @value={{this.form.organizationLearnerTypeId}}
            @onChange={{fn this.updateValue "organizationLearnerTypeId"}}
            @hideDefaultOption={{true}}
            @isFullWidth={{true}}
            @placeholder={{t "components.organizations.editing.organization-learner-type.selector.placeholder"}}
          >
            <:label>{{t "components.organizations.editing.organization-learner-type.selector.label"}}</:label>
          </PixSelect>

          <PixSelect
            required
            @aria-required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{if this.validator.errors.countryCode (t this.validator.errors.countryCode)}}
            @validationStatus={{if this.validator.errors.countryCode "error"}}
            @options={{this.countriesOptions}}
            @value={{this.form.countryCode}}
            @onChange={{fn this.updateValue "countryCode"}}
            @hideDefaultOption={{true}}
            @isSearchable={{true}}
            @locale={{this.locale.currentLocale}}
            @placeholder={{t "components.organizations.editing.country.selector.placeholder"}}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.editing.country.selector.label"}}</:label>
          </PixSelect>

          <PixInput
            @errorMessage={{this.validator.errors.provinceCode}}
            @validationStatus={{if this.validator.errors.provinceCode "error"}}
            @value={{this.form.provinceCode}}
            {{on "input" (fn this.updateFormValue "provinceCode")}}
          ><:label>{{t "components.organizations.editing.province-code.label"}}</:label></PixInput>

          <div class="organization-creation-form__input--full">
            <PixInput
              @errorMessage={{this.validator.errors.externalId}}
              @validationStatus={{if this.validator.errors.externalId "error"}}
              @value={{this.form.externalId}}
              @isFullWidth={{true}}
              {{on "input" (fn this.updateFormValue "externalId")}}
            ><:label>{{t "components.organizations.information-section-view.external-id"}}</:label></PixInput>
          </div>
        </Card>

        <Card
          class="admin-form__card organization-creation-form__card"
          @title={{t "components.organizations.creation.configuration"}}
        >
          <div class="organization-creation-form__input--full">
            <PixInput
              @errorMessage={{this.validator.errors.documentationUrl}}
              @validationStatus={{if this.validator.errors.documentationUrl "error"}}
              @value={{this.form.documentationUrl}}
              @isFullWidth={{true}}
              {{on "input" (fn this.updateFormValue "documentationUrl")}}
            ><:label>{{t "components.organizations.information-section-view.documentation-link"}}</:label></PixInput>
          </div>

          <PixSelect
            @options={{this.identityProviderOptions}}
            @value={{this.form.identityProviderForCampaigns}}
            @onChange={{fn this.updateValue "identityProviderForCampaigns"}}
            @hideDefaultOption={{true}}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.information-section-view.sso"}}</:label>
          </PixSelect>

          <PixInput
            @errorMessage={{this.validator.errors.email}}
            @validationStatus={{if this.validator.errors.email "error"}}
            @value={{this.form.email}}
            {{on "input" (fn this.updateFormValue "email")}}
          ><:label>{{t "components.organizations.information-section-view.sco-activation-email"}}</:label></PixInput>

          <PixInput
            type="number"
            @errorMessage={{this.validator.errors.credit}}
            @validationStatus={{if this.validator.errors.credit "error"}}
            @value={{this.form.credit}}
            {{on "input" (fn this.updateFormValue "credit")}}
          ><:label>{{t "components.organizations.information-section-view.credits"}}</:label></PixInput>
        </Card>

        <Card class="admin-form__card organization-creation-form__card" @title={{this.dpoSectionTitle}}>
          <PixInput
            @errorMessage={{this.validator.errors.dataProtectionOfficerLastName}}
            @validationStatus={{if this.validator.errors.dataProtectionOfficerLastName "error"}}
            @value={{this.form.dataProtectionOfficerLastName}}
            {{on "input" (fn this.updateFormValue "dataProtectionOfficerLastName")}}
          ><:label>{{t "components.organizations.information-section-view.dpo-lastname"}}</:label></PixInput>

          <PixInput
            @errorMessage={{this.validator.errors.dataProtectionOfficerFirstName}}
            @validationStatus={{if this.validator.errors.dataProtectionOfficerFirstName "error"}}
            @value={{this.form.dataProtectionOfficerFirstName}}
            {{on "input" (fn this.updateFormValue "dataProtectionOfficerFirstName")}}
          ><:label>{{t "components.organizations.information-section-view.dpo-firstname"}}</:label></PixInput>

          <div class="organization-creation-form__input--full">
            <PixInput
              @errorMessage={{this.validator.errors.dataProtectionOfficerEmail}}
              @validationStatus={{if this.validator.errors.dataProtectionOfficerEmail "error"}}
              @value={{this.form.dataProtectionOfficerEmail}}
              @isFullWidth={{true}}
              {{on "input" (fn this.updateFormValue "dataProtectionOfficerEmail")}}
            ><:label>{{t "components.organizations.information-section-view.dpo-email"}}</:label></PixInput>
          </div>
        </Card>
      </section>

      <section class="admin-form__actions">
        <PixButton @size="small" @variant="secondary" @triggerAction={{this.closeAndResetForm}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" @size="small" @variant="success">
          {{t "common.actions.save"}}
        </PixButton>
      </section>
    </form>
  </template>
}

const ORGANIZATION_FORM_VALIDATION_SCHEMA = Joi.object({
  name: Joi.string().min(1).max(255).empty(['', null]).required().messages({
    'any.required': 'Le nom ne peut pas être vide',
    'string.empty': 'Le nom ne peut pas être vide',
    'string.max': 'La longueur du nom ne doit pas excéder 255 caractères',
  }),
  externalId: Joi.string().max(255).empty(['', null]).messages({
    'string.max': "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
  }),
  provinceCode: Joi.string().max(255).empty(['', null]).messages({
    'string.max': 'La longueur du département ne doit pas excéder 255 caractères',
  }),
  dataProtectionOfficerFirstName: Joi.string().max(255).empty(['', null]).messages({
    'string.max': 'La longueur du prénom ne doit pas excéder 255 caractères.',
  }),
  dataProtectionOfficerLastName: Joi.string().max(255).empty(['', null]).messages({
    'string.max': 'La longueur du nom ne doit pas excéder 255 caractères.',
  }),
  dataProtectionOfficerEmail: Joi.string().email({ ignoreLength: true }).min(0).max(255).empty(['', null]).messages({
    'string.email': "L'e-mail n'a pas le bon format.",
    'string.max': "La longueur de l'email ne doit pas excéder 255 caractères.",
  }),
  email: Joi.string().email({ ignoreLength: true }).max(255).empty(['', null]).messages({
    'string.email': "L'e-mail n'a pas le bon format.",
    'string.max': "La longueur de l'email ne doit pas excéder 255 caractères.",
  }),
  credit: Joi.number().integer().positive().empty([0, '', null]).messages({
    'number.base': 'Le nombre de crédits doit être un nombre supérieur ou égal à 0.',
    'number.positive': 'Le nombre de crédits doit être un nombre supérieur ou égal à 0.',
  }),
  documentationUrl: Joi.string().uri({ allowRelative: true }).empty(['', null]).messages({
    'string.uri': "Le lien n'est pas valide.",
  }),
  administrationTeamId: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.editing.administration-team.selector.error-message',
    'string.empty': 'components.organizations.editing.administration-team.selector.error-message',
  }),
  countryCode: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.editing.country.selector.error-message',
    'string.empty': 'components.organizations.editing.country.selector.error-message',
  }),
  organizationLearnerTypeId: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.editing.organization-learner-type.selector.error-message',
    'string.empty': 'components.organizations.editing.organization-learner-type.selector.error-message',
  }),
  identityProviderForCampaigns: Joi.string().empty(['', null]),
});
