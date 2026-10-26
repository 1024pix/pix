import { PixButton, PixCheckbox, PixInput, PixModal, PixSelect } from '@1024pix/nebulix-ember';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';
import sortBy from 'lodash/sortBy';
import SelectSearchWrapper from 'pix-admin/components/ui/select-search-wrapper';
import { FormValidator } from 'pix-admin/utils/form-validator';

import { types } from '../../models/certification-center';

export default class InformationEdit extends Component {
  @service store;
  @tracked selectedHabilitations = [];
  @tracked structureCategories = [];
  @tracked attachedOrganization = null;
  @tracked form = {};
  certificationCenterTypes = types;
  initialCategoryId = null;

  validator = new FormValidator(CERTIFICATION_CENTER_FORM_SCHEMA);

  constructor() {
    super(...arguments);

    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.selectedHabilitations = habilitations;
    });

    this.#loadStructureCategories();

    this.form = {
      name: this.args.certificationCenter.name,
      externalId: this.args.certificationCenter.externalId,
      type: this.args.certificationCenter.type,
      dataProtectionOfficerFirstName: this.args.certificationCenter.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this.args.certificationCenter.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this.args.certificationCenter.dataProtectionOfficerEmail,
      categoryId: this.args.certificationCenter.categoryId ? `${this.args.certificationCenter.categoryId}` : null,
    };
    this.initialCategoryId = this.form.categoryId;
  }

  async #loadStructureCategories() {
    this.structureCategories = await this.store.findAll('structure-category');
  }

  get sortedHabilitations() {
    return sortBy(this.args.availableHabilitations, 'id');
  }

  get categoriesOptions() {
    return this.structureCategories.map((structureCategory) => ({
      value: structureCategory.id,
      label: structureCategory.label,
    }));
  }

  onFormInputChange = (name) => (event) => {
    this.form = { ...this.form, [name]: event.target.value };
    this.validator.validateField(name, this.form[name]);
  };

  onTypeChange = (value) => {
    this.form = { ...this.form, type: value ? value.trim() : value };
    this.validator.validateField('type', this.form.type);
  };

  onCategoryChange = (value) => {
    this.form = { ...this.form, categoryId: value };
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

    if (this.form.categoryId !== this.initialCategoryId) {
      this.attachedOrganization = await this.#findAttachedOrganization();
      if (this.attachedOrganization) return;
    }

    return this.#updateCertificationCenter();
  };

  confirmUpdate = () => {
    this.attachedOrganization = null;
    return this.#updateCertificationCenter();
  };

  closeConfirmationModal = () => {
    this.attachedOrganization = null;
  };

  async #findAttachedOrganization() {
    const [attachedOrganization] = await this.store.query('attached-organization', {
      certificationCenterId: this.args.certificationCenter.id,
    });

    return attachedOrganization;
  }

  #updateCertificationCenter() {
    const categoryLabel = this.structureCategories.find((category) => category.id === this.form.categoryId)?.label;

    this.args.certificationCenter.setProperties({
      name: this.form.name,
      externalId: this.form.externalId || null,
      type: this.form.type,
      dataProtectionOfficerFirstName: this.form.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this.form.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this.form.dataProtectionOfficerEmail,
      categoryId: this.form.categoryId,
      categoryLabel,
      habilitations: this.selectedHabilitations,
    });

    this.args.toggleEditMode();
    return this.args.onSubmit();
  }

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

      <SelectSearchWrapper
        @texts={{hash
          placeholder=(t "pages.certification-centers.information-edit.category.selector.placeholder")
          selectSearchLabel=(t "pages.certification-centers.information-edit.category.selector.search-label")
          searchPlaceholder=(t "pages.certification-centers.information-edit.category.selector.search-placeholder")
        }}
        @options={{this.categoriesOptions}}
        @value={{this.form.categoryId}}
        @onChange={{this.onCategoryChange}}
        @hideDefaultOption={{true}}
      >
        <:label>{{t "pages.certification-centers.information-edit.category.selector.label"}}</:label>
      </SelectSearchWrapper>

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

    {{#if this.attachedOrganization}}
      <PixModal
        @title={{t "pages.certification-centers.information-edit.category.confirmation-modal.title"}}
        @showModal={{true}}
        @onCloseButtonClick={{this.closeConfirmationModal}}
      >
        <:content>
          <p>{{t
              "pages.certification-centers.information-edit.category.confirmation-modal.attached-organization"
              organizationName=this.attachedOrganization.name
            }}</p>
          <p>{{t "pages.certification-centers.information-edit.category.confirmation-modal.warning"}}</p>
        </:content>
        <:footer>
          <PixButton @triggerAction={{this.closeConfirmationModal}} @size="small" @variant="secondary">
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @triggerAction={{this.confirmUpdate}} @size="small">
            {{t "common.actions.confirm"}}
          </PixButton>
        </:footer>
      </PixModal>
    {{/if}}
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
  // TODO: rendre la catégorie obligatoire une fois qu'elle sera renseignée à la création d'un centre
  categoryId: Joi.string().empty(['', null]),
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
