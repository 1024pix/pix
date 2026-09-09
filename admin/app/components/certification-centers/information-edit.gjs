import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';
import sortBy from 'lodash/sortBy';
import { FormValidator } from 'pix-admin/utils/form-validator';

import { types } from '../../models/certification-center';

export default class InformationEdit extends Component {
  @service store;
  @tracked selectedHabilitations = [];
  @tracked form = {};
  certificationCenterTypes = types;

  validator = new FormValidator(CERTIFICATION_CENTER_FORM_SCHEMA);

  constructor() {
    super(...arguments);

    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.selectedHabilitations = habilitations;
    });

    this.form = {
      name: this.args.certificationCenter.name,
      externalId: this.args.certificationCenter.externalId,
      type: this.args.certificationCenter.type,
      dataProtectionOfficerFirstName: this.args.certificationCenter.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this.args.certificationCenter.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this.args.certificationCenter.dataProtectionOfficerEmail,
    };
  }

  get sortedHabilitations() {
    return sortBy(this.args.availableHabilitations, 'id');
  }

  onFormInputChange = (name) => (event) => {
    this.form = { ...this.form, [name]: event.target.value };
    this.validator.validateField(name, this.form[name]);
  };

  onTypeChange = (value) => {
    this.form = { ...this.form, type: value ? value.trim() : value };
    this.validator.validateField('type', this.form.type);
  };

  onToggleHabilitation = (habilitation) => {
    const index = this.selectedHabilitations.findIndex((h) => h.id === habilitation.id);
    if (index !== -1) {
      this.selectedHabilitations.splice(index, 1);
      this.selectedHabilitations = [...this.selectedHabilitations];
    } else {
      this.selectedHabilitations = [...this.selectedHabilitations, habilitation];
    }
  };

  isSelectedHabilitation = (habilitation) => {
    return this.selectedHabilitations.some((h) => h.id === habilitation.id);
  };

  save = async (event) => {
    event.preventDefault();

    const isValid = this.validator.validate(this.form);
    if (!isValid) return;

    this.args.certificationCenter.setProperties({
      name: this.form.name,
      externalId: this.form.externalId || null,
      type: this.form.type,
      dataProtectionOfficerFirstName: this.form.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this.form.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this.form.dataProtectionOfficerEmail,
      habilitations: this.selectedHabilitations,
    });

    this.args.toggleEditMode();
    return this.args.onSubmit();
  };

  <template>
    <h2 class="certification-center-information__edit-title">Modifier un centre de certification</h2>
    <form class="form certification-center-information__edit-form" onsubmit={{this.save}}>

      <PixInput
        @value={{this.form.name}}
        @requiredLabel={{true}}
        @errorMessage={{this.validator.errors.name}}
        @validationStatus={{if this.validator.errors.name "error"}}
        {{on "input" (this.onFormInputChange "name")}}
      >
        <:label>Nom du centre</:label>
      </PixInput>

      <PixSelect
        @options={{this.certificationCenterTypes}}
        @texts={{hash placeholder="-- Choisissez --"}}
        @value={{this.form.type}}
        @onChange={{this.onTypeChange}}
        @errorMessage={{this.validator.errors.type}}
      >
        <:label>Type</:label>
        <:default as |certificationCenterType|>{{certificationCenterType.label}}</:default>
      </PixSelect>

      <PixInput
        @value={{this.form.externalId}}
        @errorMessage={{this.validator.errors.externalId}}
        @validationStatus={{if this.validator.errors.externalId "error"}}
        {{on "input" (this.onFormInputChange "externalId")}}
      >
        <:label>Identifiant externe</:label>
      </PixInput>

      <PixInput
        @value={{this.form.dataProtectionOfficerFirstName}}
        @errorMessage={{this.validator.errors.dataProtectionOfficerFirstName}}
        @validationStatus={{if this.validator.errors.dataProtectionOfficerFirstName "error"}}
        {{on "input" (this.onFormInputChange "dataProtectionOfficerFirstName")}}
      >
        <:label>Prénom du <abbr title="Délégué à la protection des données">DPO</abbr></:label>
      </PixInput>

      <PixInput
        @value={{this.form.dataProtectionOfficerLastName}}
        @errorMessage={{this.validator.errors.dataProtectionOfficerLastName}}
        @validationStatus={{if this.validator.errors.dataProtectionOfficerLastName "error"}}
        {{on "input" (this.onFormInputChange "dataProtectionOfficerLastName")}}
      >
        <:label>Nom du <abbr title="Délégué à la protection des données">DPO</abbr></:label>
      </PixInput>

      <PixInput
        @value={{this.form.dataProtectionOfficerEmail}}
        @errorMessage={{this.validator.errors.dataProtectionOfficerEmail}}
        @validationStatus={{if this.validator.errors.dataProtectionOfficerEmail "error"}}
        {{on "input" (this.onFormInputChange "dataProtectionOfficerEmail")}}
      >
        <:label>Adresse e-mail du <abbr title="Délégué à la protection des données">DPO</abbr></:label>
      </PixInput>

      <span class="field-label">Habilitations aux certifications complémentaires</span>

      <ul class="form-field certification-center-information__edit-form__habilitations-checkbox-list">
        {{#each this.sortedHabilitations as |habilitation|}}
          <li class="habilitation-entry">
            <PixCheckbox
              @checked={{this.isSelectedHabilitation habilitation}}
              {{on "change" (fn this.onToggleHabilitation habilitation)}}
            >
              <:label>
                {{habilitation.label}}
              </:label>
            </PixCheckbox>
          </li>
        {{/each}}
      </ul>

      <div class="certification-center-information__action-buttons">
        <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleEditMode}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" @size="small" @variant="primary" @triggerAction={{this.updateCertificationCenter}}>
          {{t "common.actions.save"}}
        </PixButton>
      </div>
    </form>
  </template>
}

const CERTIFICATION_CENTER_FORM_SCHEMA = Joi.object({
  name: Joi.string().min(1).max(255).empty(['', null]).required().messages({
    'any.required': 'Le nom ne peut pas être vide',
    'string.empty': 'Le nom ne peut pas être vide',
    'string.max': 'La longueur du nom ne doit pas excéder 255 caractères',
  }),
  type: Joi.string().empty(['', null]).required().messages({
    'any.required': 'Le type ne peut pas être vide',
    'string.empty': 'Le type ne peut pas être vide',
  }),
  externalId: Joi.string().min(0).max(255).empty(['', null]).messages({
    'string.max': "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
  }),
  dataProtectionOfficerFirstName: Joi.string().min(0).max(255).empty(['', null]).messages({
    'string.max': 'La longueur du prénom du DPO ne doit pas excéder 255 caractères',
  }),
  dataProtectionOfficerLastName: Joi.string().min(0).max(255).empty(['', null]).messages({
    'string.max': 'La longueur du nom du DPO ne doit pas excéder 255 caractères',
  }),
  dataProtectionOfficerEmail: Joi.string().email({ ignoreLength: true }).min(0).max(255).empty(['', null]).messages({
    'string.email': "L'adresse e-mail du DPO n'a pas le bon format.",
    'string.max': "La longueur de l'adresse e-mail du DPO ne doit pas excéder 255 caractères.",
  }),
});
