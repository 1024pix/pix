import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';
import sortBy from 'lodash/sortBy';
import { FormValidator } from 'pix-admin/utils/form-validator';

import { types } from '../../models/certification-center';
import Card from '../card';

export default class CreationForm extends Component {
  @service pixToast;
  @service router;
  @service store;
  @service intl;

  @tracked form = {
    name: '',
    type: '',
    externalId: '',
    dataProtectionOfficerLastName: '',
    dataProtectionOfficerFirstName: '',
    dataProtectionOfficerEmail: '',
    selectedHabilitations: [],
  };

  certificationCenterTypes = types;

  validator = new FormValidator(CERTIFICATION_CENTER_CREATION_FORM_VALIDATOR_SCHEMA);

  get sortedHabilitations() {
    return sortBy(this.args.habilitations, 'id');
  }

  get dpoSectionTitle() {
    return `${this.intl.t('components.certification-centers.creation.dpo.definition')} (${this.intl.t('components.certification-centers.creation.dpo.acronym')})`;
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

  onToggleHabilitation = (habilitation) => {
    const index = this.form.selectedHabilitations.findIndex((h) => h.id === habilitation.id);
    if (index !== -1) {
      this.form.selectedHabilitations.splice(index, 1);
      this.form.selectedHabilitations = [...this.form.selectedHabilitations];
    } else {
      this.form.selectedHabilitations = [...this.form.selectedHabilitations, habilitation];
    }
  };

  focusOnFirstFieldInError = () => {
    const fieldsInError = Object.keys(this.validator.errors);
    const firstHtmlElementInError = document.getElementById(fieldsInError[0]);
    firstHtmlElementInError.focus();
  };

  save = async (event) => {
    event.preventDefault();
    const isFormValid = this.validator.validate(this.form);
    if (!isFormValid) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certification-centers.creation.error-messages.error-toast'),
      });
      this.focusOnFirstFieldInError();
      return;
    }

    const record = this.store.createRecord('certification-center', {
      name: this.form.name,
      type: this.form.type,
      externalId: this.form.externalId?.trim() ? this.form.externalId : null,
      dataProtectionOfficerFirstName: this.form.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this.form.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this.form.dataProtectionOfficerEmail,
      habilitations: [...this.form.selectedHabilitations],
    });

    try {
      await record.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.certification-centers.creation.success-message'),
      });
      this.router.transitionTo('authenticated.certification-centers.get', record.id);
    } catch (error) {
      const message = error?.errors
        ? error.errors?.map((e) => e.detail).join(', ')
        : this.intl.t('common.notifications.generic-error');
      this.pixToast.sendErrorNotification({ message });
    }
  };

  <template>
    <form {{on "submit" this.save}} ...attributes>
      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>

      <section class="admin-form__content certification-center-creation-form">
        <Card
          class="admin-form__card certification-center-creation-form__card"
          @title={{t "common.cards.titles.general-information"}}
        >
          <div class="certification-center-creation-form__input--full">
            <PixInput
              @id="name"
              @requiredLabel={{t "common.fields.required-field"}}
              required={{false}}
              placeholder={{concat
                (t "common.words.example-abbr")
                " "
                (t "components.certification-centers.creation.name.placeholder")
              }}
              @validationStatus={{if this.validator.errors.name "error"}}
              @errorMessage={{if this.validator.errors.name (t this.validator.errors.name)}}
              {{on "change" (fn this.handleInputChange "name")}}
              @isFullWidth={{true}}
            >
              <:label>{{t "components.certification-centers.creation.name.label"}}</:label>
            </PixInput>
          </div>

          <PixSelect
            @id="type"
            @onChange={{fn this.handleSelectChange "type"}}
            @options={{this.certificationCenterTypes}}
            @placeholder={{t "components.certification-centers.creation.type.placeholder"}}
            @hideDefaultOption={{true}}
            @value={{this.form.type}}
            @requiredLabel={{t "common.fields.required-field"}}
            @errorMessage={{if this.validator.errors.type (t this.validator.errors.type)}}
            @isFullWidth={{true}}
          >
            <:label>{{t "components.certification-centers.creation.type.label"}}</:label>
            <:default as |certificationCenterType|>{{certificationCenterType.label}}</:default>
          </PixSelect>

          <PixInput
            @id="externalId"
            {{on "change" (fn this.handleInputChange "externalId")}}
            placeholder={{t "components.certification-centers.creation.external-id.placeholder"}}
          >
            <:label>{{t "components.certification-centers.creation.external-id.label"}}</:label>
          </PixInput>
        </Card>

        <Card class="admin-form__card" @title={{t "components.certification-centers.creation.configuration"}}>
          <h2 class="admin-form__content title">{{t
              "components.certification-centers.creation.complementary-certifications-habilitations"
            }}</h2>
          <ul class="habilitations-section">
            {{#each this.sortedHabilitations as |habilitation index|}}
              <li class="habilitations-section__habilitation-item-container">
                <div class="habilitations-section__habilitation-item">
                  <PixCheckbox
                    @id={{concat "habilitation_" index}}
                    onChange={{fn this.onToggleHabilitation habilitation}}
                    class="form-field"
                  >
                    <:label>{{habilitation.label}}</:label>
                  </PixCheckbox>

                </div>
              </li>
            {{/each}}
          </ul>
        </Card>

        <Card class="admin-form__card certification-center-creation-form__card" @title={{this.dpoSectionTitle}}>
          <PixInput
            @id="dataProtectionOfficerLastName"
            {{on "change" (fn this.handleInputChange "dataProtectionOfficerLastName")}}
            placeholder={{concat (t "common.words.example-abbr") " Dupont"}}
          >
            <:label>{{t "components.certification-centers.creation.dpo.lastname"}}
              <abbr title={{t "components.certification-centers.creation.dpo.definition"}}>{{t
                  "components.certification-centers.creation.dpo.acronym"
                }}</abbr></:label>
          </PixInput>

          <PixInput
            @id="dataProtectionOfficerFirstName"
            {{on "change" (fn this.handleInputChange "dataProtectionOfficerFirstName")}}
            placeholder={{concat (t "common.words.example-abbr") " Marie"}}
          >
            <:label>{{t "components.certification-centers.creation.dpo.firstname"}}
              <abbr title={{t "components.certification-centers.creation.dpo.definition"}}>{{t
                  "components.certification-centers.creation.dpo.acronym"
                }}</abbr></:label>
          </PixInput>

          <div class="certification-center-creation-form__input--full">
            <PixInput
              @id="dataProtectionOfficerEmail"
              @isFullWidth={{true}}
              placeholder={{concat (t "common.words.example-abbr") " marie-dupont@example.net"}}
              {{on "change" (fn this.handleInputChange "dataProtectionOfficerEmail")}}
              @validationStatus={{if this.validator.errors.dataProtectionOfficerEmail "error"}}
              @errorMessage={{if
                this.validator.errors.dataProtectionOfficerEmail
                (t this.validator.errors.dataProtectionOfficerEmail)
              }}
            >
              <:label>{{t "components.certification-centers.creation.dpo.email"}}
                <abbr title={{t "components.certification-centers.creation.dpo.definition"}}>{{t
                    "components.certification-centers.creation.dpo.acronym"
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
          {{t "common.actions.add"}}
        </PixButton>
      </section>
    </form>
  </template>
}

const CERTIFICATION_CENTER_CREATION_FORM_VALIDATOR_SCHEMA = Joi.object({
  name: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.certification-centers.creation.error-messages.name',
    'string.empty': 'components.certification-centers.creation.error-messages.name',
  }),
  type: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.certification-centers.creation.error-messages.type',
    'string.empty': 'components.certification-centers.creation.error-messages.type',
  }),
  externalId: Joi.string().empty(['', null]).optional(),
  dataProtectionOfficerLastName: Joi.string().empty(['', null]).optional(),
  dataProtectionOfficerFirstName: Joi.string().empty(['', null]).optional(),

  dataProtectionOfficerEmail: Joi.string().email().empty(['', null]).optional().messages({
    'string.email': 'components.certification-centers.creation.error-messages.dpo-email',
  }),
  selectedHabilitations: Joi.array().optional(),
});
