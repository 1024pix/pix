import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';
import { FormValidator } from 'pix-admin/utils/form-validator';

import Card from '../card';

export default class OrganizationCreationForm extends Component {
  @service store;
  @service intl;
  @service pixToast;
  @service locale;

  @tracked form = {
    administrationTeamId: this.parentOrganizationAdministrationTeamId,
    type: this.parentOrganizationType,
    countryCode: this.parentOrganizationCountryCode,
    documentationUrl: this.parentOrganizationDocumentationUrl,
  };

  organizationTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
    { value: 'SCO-1D', label: 'Établissement scolaire du premier degré' },
  ];

  validator = new FormValidator(ORGANIZATION_CREATION_FORM_VALIDATION_SCHEMA);

  get administrationTeamsOptions() {
    const options = this.args.administrationTeams.map((administrationTeam) => ({
      value: administrationTeam.id,
      label: administrationTeam.name,
    }));
    return options;
  }

  get countriesOptions() {
    const options = this.args.countries.map((country) => ({
      value: country.code,
      label: `${country.name} (${country.code})`,
    }));

    return options;
  }

  get organizationLearnerTypesOptions() {
    const options = this.args.organizationLearnerTypes.map((organizationLearnerType) => ({
      value: organizationLearnerType.id,
      label: organizationLearnerType.name,
    }));

    return options;
  }

  get submitButtonText() {
    return this.args.parentOrganization?.name
      ? 'components.organizations.creation.actions.add-child-organization'
      : 'common.actions.add';
  }

  get dpoSectionTitle() {
    return `${this.intl.t('components.organizations.creation.dpo.definition')} (${this.intl.t('components.organizations.creation.dpo.acronym')})`;
  }

  get parentOrganizationAdministrationTeamId() {
    return this.args.parentOrganization?.administrationTeamId
      ? `${this.args.parentOrganization.administrationTeamId}`
      : undefined;
  }

  get parentOrganizationType() {
    return this.args.parentOrganization?.type ? `${this.args.parentOrganization.type}` : undefined;
  }

  get parentOrganizationCountryCode() {
    return this.args.parentOrganization?.countryCode ? `${this.args.parentOrganization.countryCode}` : undefined;
  }

  get parentOrganizationDocumentationUrl() {
    return this.args.parentOrganization?.documentationUrl
      ? `${this.args.parentOrganization.documentationUrl}`
      : undefined;
  }

  handleInputChange = (key, event) => {
    const { value } = event.target;
    this.validator.validateField(key, value);
    this.form = { ...this.form, [key]: value };
  };

  handleSelectChange = (key, value) => {
    this.validator.validateField(key, value);
    this.form = { ...this.form, [key]: value };
  };

  focusOnFirstFieldInError = () => {
    const fieldsInError = Object.keys(this.validator.errors);
    const firstHtmlElementInError = document.getElementById(fieldsInError[0]);
    firstHtmlElementInError.focus();
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const isFormValid = this.validator.validate(this.form);
    if (!isFormValid) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.organizations.creation.error-messages.error-toast'),
      });
      this.focusOnFirstFieldInError();
      return;
    }
    this.args.onSubmit(this.form);
  };

  <template>
    <form class="admin-form" {{on "submit" this.handleSubmit}}>
      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>
      <section class="admin-form__content organization-creation-form">
        <Card
          class="admin-form__card organization-creation-form__card"
          @title={{t "common.cards.titles.general-information"}}
        >
          {{#if @parentOrganization}}
            <h2 class="admin-form__content title organization-creation-form__parent-name--full">
              {{t
                "components.organizations.creation.parent-organization-name"
                parentOrganizationName=@parentOrganization.name
              }}
            </h2>
          {{/if}}

          <div class="organization-creation-form__input--full">
            <PixInput
              @id="name"
              {{on "change" (fn this.handleInputChange "name")}}
              @requiredLabel={{t "common.fields.required-field"}}
              placeholder={{concat
                (t "common.words.example-abbr")
                " "
                (t "components.organizations.creation.name.placeholder")
              }}
              required={{false}}
              @validationStatus={{if this.validator.errors.name "error"}}
              @errorMessage={{if this.validator.errors.name (t this.validator.errors.name)}}
              @isFullWidth={{true}}
            >
              <:label>{{t "components.organizations.creation.name.label"}}</:label>
            </PixInput>
          </div>

          <PixSelect
            @id="type"
            @onChange={{fn this.handleSelectChange "type"}}
            @options={{this.organizationTypes}}
            @placeholder={{t "components.organizations.creation.type.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{this.form.type}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{if this.validator.errors.type (t this.validator.errors.type)}}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.creation.type.label"}}</:label>
            <:default as |organizationType|>{{organizationType.label}}</:default>
          </PixSelect>

          <PixSelect
            @id="administrationTeamId"
            @onChange={{fn this.handleSelectChange "administrationTeamId"}}
            @options={{this.administrationTeamsOptions}}
            @placeholder={{t "components.organizations.creation.administration-team.selector.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{this.form.administrationTeamId}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{if
              this.validator.errors.administrationTeamId
              (t this.validator.errors.administrationTeamId)
            }}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.creation.administration-team.selector.label"}}</:label>
          </PixSelect>

          <PixSelect
            @id="organizationLearnerTypeId"
            @onChange={{fn this.handleSelectChange "organizationLearnerTypeId"}}
            @options={{this.organizationLearnerTypesOptions}}
            @placeholder={{t "components.organizations.creation.organization-learner-type.selector.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{this.form.organizationLearnerTypeId}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{if
              this.validator.errors.organizationLearnerTypeId
              (t this.validator.errors.organizationLearnerTypeId)
            }}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.creation.organization-learner-type.selector.label"}}</:label>
          </PixSelect>
          <PixSelect
            @id="countryCode"
            class="organization-creation-form__field--force-grid-start"
            @onChange={{fn this.handleSelectChange "countryCode"}}
            @options={{this.countriesOptions}}
            @placeholder={{t "components.organizations.creation.country.selector.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{this.form.countryCode}}
            @requiredLabel={{t "common.fields.required-field"}}
            @isSearchable={{true}}
            @locale={{this.locale.currentLocale}}
            @errorMessage={{if this.validator.errors.countryCode (t this.validator.errors.countryCode)}}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.organizations.creation.country.selector.label"}}</:label>
          </PixSelect>

          <PixInput
            @id="provinceCode"
            {{on "change" (fn this.handleInputChange "provinceCode")}}
            placeholder={{concat (t "common.words.example-abbr") " 078"}}
          >
            <:label>{{t "components.organizations.creation.province-code"}}</:label>
          </PixInput>

          <div class="organization-creation-form__input--full">
            <PixInput
              @id="externalId"
              {{on "change" (fn this.handleInputChange "externalId")}}
              placeholder={{t "components.organizations.creation.external-id.placeholder"}}
              @isFullWidth={{true}}
            >
              <:label>{{t "components.organizations.creation.external-id.label"}}</:label>
            </PixInput>
          </div>
        </Card>

        <Card
          class="admin-form__card organization-creation-form__card"
          @title={{t "components.organizations.creation.configuration"}}
        >
          <div class="organization-creation-form__input--full">
            <PixInput
              @id="documentationUrl"
              {{on "change" (fn this.handleInputChange "documentationUrl")}}
              placeholder={{concat (t "common.words.example-abbr") " https://www.documentation.org"}}
              @value="{{this.form.documentationUrl}}"
              @validationStatus={{if this.validator.errors.documentationUrl "error"}}
              @errorMessage={{if this.validator.errors.documentationUrl (t this.validator.errors.documentationUrl)}}
              @isFullWidth={{true}}
            >
              <:label>{{t "components.organizations.creation.documentation-link"}}</:label>
            </PixInput>
          </div>
        </Card>

        <Card class="admin-form__card organization-creation-form__card" @title={{this.dpoSectionTitle}}>
          <PixInput
            @id="dataProtectionOfficerLastName"
            {{on "change" (fn this.handleInputChange "dataProtectionOfficerLastName")}}
            placeholder={{concat (t "common.words.example-abbr") " Dupont"}}
          >
            <:label>{{t "components.organizations.creation.dpo.lastname"}}
              <abbr title={{t "components.organizations.creation.dpo.definition"}}>{{t
                  "components.organizations.creation.dpo.acronym"
                }}</abbr></:label>
          </PixInput>

          <PixInput
            @id="dataProtectionOfficerFirstName"
            {{on "change" (fn this.handleInputChange "dataProtectionOfficerFirstName")}}
            placeholder={{concat (t "common.words.example-abbr") " Jean"}}
          >
            <:label>{{t "components.organizations.creation.dpo.firstname"}}
              <abbr title={{t "components.organizations.creation.dpo.definition"}}>{{t
                  "components.organizations.creation.dpo.acronym"
                }}</abbr></:label>
          </PixInput>

          <div class="organization-creation-form__input--full">
            <PixInput
              @id="dataProtectionOfficerEmail"
              {{on "change" (fn this.handleInputChange "dataProtectionOfficerEmail")}}
              placeholder={{concat (t "common.words.example-abbr") " jean-dupont@example.net"}}
              @validationStatus={{if this.validator.errors.dataProtectionOfficerEmail "error"}}
              @errorMessage={{if
                this.validator.errors.dataProtectionOfficerEmail
                (t this.validator.errors.dataProtectionOfficerEmail)
              }}
              @isFullWidth={{true}}
            >
              <:label>{{t "components.organizations.creation.dpo.email"}}
                <abbr title={{t "components.organizations.creation.dpo.definition"}}>{{t
                    "components.organizations.creation.dpo.acronym"
                  }}</abbr></:label>
            </PixInput>
          </div>
        </Card>
      </section>

      <section class="admin-form__actions">
        <PixButton @size="small" @variant="secondary" @triggerAction={{@onCancel}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" @size="small" @variant="success">
          {{t this.submitButtonText}}
        </PixButton>
      </section>
    </form>
  </template>
}

const ORGANIZATION_CREATION_FORM_VALIDATION_SCHEMA = Joi.object({
  name: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.creation.error-messages.name',
    'string.empty': 'components.organizations.creation.error-messages.name',
  }),
  type: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.creation.error-messages.type',
    'string.empty': 'components.organizations.creation.error-messages.type',
  }),
  administrationTeamId: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.creation.error-messages.administration-team',
    'string.empty': 'components.organizations.creation.error-messages.administration-team',
  }),
  organizationLearnerTypeId: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.creation.error-messages.organization-learner-type',
    'string.empty': 'components.organizations.creation.error-messages.organization-learner-type',
  }),
  countryCode: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.creation.error-messages.country',
    'string.empty': 'components.organizations.creation.error-messages.country',
  }),
  provinceCode: Joi.string().empty(['', null]).optional(),
  externalId: Joi.string().empty(['', null]).optional(),
  documentationUrl: Joi.string().uri().empty(['', null]).optional().messages({
    'string.uri': 'components.organizations.creation.error-messages.documentation-url',
  }),
  dataProtectionOfficerLastName: Joi.string().empty(['', null]).optional(),
  dataProtectionOfficerFirstName: Joi.string().empty(['', null]).optional(),

  dataProtectionOfficerEmail: Joi.string().email().empty(['', null]).optional().messages({
    'string.email': 'components.organizations.creation.error-messages.dpo-email',
  }),
});
