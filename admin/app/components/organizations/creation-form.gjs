import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Joi from 'joi';

import Card from '../card';

export default class OrganizationCreationForm extends Component {
  @service store;
  @service intl;
  @service formValidator;
  @service pixToast;

  organizationTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
    { value: 'SCO-1D', label: 'Établissement scolaire du premier degré' },
  ];

  validationSchema = Joi.object({
    name: Joi.string()
      .messages({
        'string.empty': 'Le nom est requis',
        'any.required': 'Le nom est requis',
      })
      .required(),
    administrationTeamId: Joi.string().required().messages({ 'any.required': "L'équipe en charge est requise" }),
    type: Joi.string()
      .messages({
        'any.required': 'Le type est requis',
      })
      .required(),
    countryCode: Joi.string().required().messages({ 'any.required': 'Le code pays est requis' }),
  });

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

  get submitButtonText() {
    return this.args.parentOrganizationName
      ? 'components.organizations.creation.actions.add-child-organization'
      : 'common.actions.add';
  }

  @action
  handleOrganizationTypeSelectionChange(value) {
    this.formValidator.validateField({
      fieldSchema: this.validationSchema.extract('type'),
      field: 'type',
      value,
    });

    this.args.organization.type = value;
  }

  @action
  handleOrganizationNameChange(event) {
    this.formValidator.validateField({
      fieldSchema: this.validationSchema.extract('name'),
      field: 'name',
      value: event.target.value,
    });
    this.args.organization.name = event.target.value;
  }

  @action
  handleAdministrationTeamSelectionChange(value) {
    this.formValidator.validateField({
      fieldSchema: this.validationSchema.extract('administrationTeamId'),
      field: 'administrationTeamId',
      value,
    });

    this.args.organization.administrationTeamId = value;
  }

  @action
  handleCountrySelectionChange(value) {
    this.formValidator.validateField({
      fieldSchema: this.validationSchema.extract('countryCode'),
      field: 'countryCode',
      value,
    });

    this.args.organization.countryCode = value;
  }

  @action
  handleDocumentationUrlChange(event) {
    this.args.organization.documentationUrl = event.target.value;
  }

  @action
  handleCreditsChange(event) {
    this.args.organization.credit = +event.target.value;
  }

  @action
  handleDataProtectionOfficerFirstNameChange(event) {
    this.args.organization.dataProtectionOfficerFirstName = event.target.value;
  }

  @action
  handleDataProtectionOfficerLastNameChange(event) {
    this.args.organization.dataProtectionOfficerLastName = event.target.value;
  }

  @action
  handleDataProtectionOfficerEmailChange(event) {
    this.args.organization.dataProtectionOfficerEmail = event.target.value;
  }

  @action
  async handleSubmit(event) {
    event.preventDefault();
    this.formValidator.validateForm({
      schema: this.validationSchema,
      form: this.args.organization.getProperties('name', 'type', 'administrationTeamId', 'countryCode'),
    });

    if (Object.keys(this.formValidator.errors).length) {
      return this.pixToast.sendErrorNotification({
        message: this.intl.t('components.organizations.creation.required-fields-error'),
      });
    }
    await this.args.onSubmit();
  }

  <template>
    <form class="admin-form" {{on "submit" this.handleSubmit}}>
      <section class="admin-form__content admin-form__content--with-counters">
        <Card class="admin-form__card" @title="Information générique">
          {{#if @parentOrganizationName}}
            <h2 class="admin-form__content title">
              {{t
                "components.organizations.creation.parent-organization-name"
                parentOrganizationName=@parentOrganizationName
              }}
            </h2>
          {{/if}}
          <PixInput
            {{on "input" this.handleOrganizationNameChange}}
            @id="organizationName"
            required={{true}}
            aria-required={{true}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{this.formValidator.errors.name}}
            @validationStatus={{if this.formValidator.errors.name "error"}}
          >
            <:label>Nom</:label>
          </PixInput>

          <PixSelect
            @onChange={{this.handleOrganizationTypeSelectionChange}}
            @options={{this.organizationTypes}}
            @placeholder="Type d'organisation"
            @hideDefaultOption={{true}}
            @value={{@organization.type}}
            required
            aria-required={{true}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{this.formValidator.errors.type}}
          >
            <:label>Sélectionner un type d'organisation</:label>
            <:default as |organizationType|>{{organizationType.label}}</:default>
          </PixSelect>

          <PixSelect
            @onChange={{this.handleAdministrationTeamSelectionChange}}
            @options={{this.administrationTeamsOptions}}
            @placeholder={{t "components.organizations.creation.administration-team.selector.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{@organization.administrationTeamId}}
            required
            aria-required={{true}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{this.formValidator.errors.administrationTeamId}}
          >
            <:label>{{t "components.organizations.creation.administration-team.selector.label"}}</:label>
          </PixSelect>

          <PixSelect
            @onChange={{this.handleCountrySelectionChange}}
            @options={{this.countriesOptions}}
            @placeholder={{t "components.organizations.creation.country.selector.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{@organization.countryCode}}
            required
            @aria-required={{true}}
            @requiredLabel={{t "common.fields.required-field"}}
            @isSearchable={{true}}
            @errorMessage={{this.formValidator.errors.countryCode}}
          >
            <:label>{{t "components.organizations.creation.country.selector.label"}}</:label>
          </PixSelect>

        </Card>

        <Card class="admin-form__card" @title="Configuration">
          <PixInput @id="documentationUrl" onchange={{this.handleDocumentationUrlChange}}>
            <:label>Lien vers la documentation</:label>
          </PixInput>
          <PixInput @id="credits" onchange={{this.handleCreditsChange}} type="number">
            <:label>Crédits</:label>
          </PixInput>
        </Card>

        <Card class="admin-form__card" @title="Data Privacy Officer">
          <PixInput @id="dataProtectionOfficerFirstName" onchange={{this.handleDataProtectionOfficerFirstNameChange}}>
            <:label>Prénom du DPO</:label>
          </PixInput>
          <PixInput @id="dataProtectionOfficerLastName" onchange={{this.handleDataProtectionOfficerLastNameChange}}>
            <:label>Nom du DPO</:label>
          </PixInput>
          <PixInput @id="dataProtectionOfficerEmail" onchange={{this.handleDataProtectionOfficerEmailChange}}>
            <:label>Adresse e-mail du DPO</:label>
          </PixInput>
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
