import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';

import { FormValidator } from '../../utils/form-validator';

const categories = [
  { value: 'FULL_RATE', label: 'Tarif plein' },
  { value: 'SPECIAL_REDUCE_RATE', label: 'Tarif réduit spécial' },
  { value: 'REDUCE_RATE', label: 'Tarif réduit' },
  { value: 'PUBLIC_RATE', label: 'Tarif public' },
  { value: 'FREE_RATE', label: 'Tarif gratuit' },
];

export default class PlacesLotCreationForm extends Component {
  @service pixToast;
  @service intl;

  @tracked selectedCategory = null;
  @tracked form = {};
  @tracked isLoading = false;

  validator = new FormValidator(PLACES_LOT_FORM_SCHEMA);

  constructor() {
    super(...arguments);
    this.categories = categories;
    this.form = {
      count: undefined,
      reference: undefined,
      activationDate: new Date().toISOString().split('T')[0],
      category: undefined,
      expirationDate: undefined,
    };
  }

  @action
  async onSubmit(event) {
    if (this.isLoading) return;

    event.preventDefault();

    const isFormValid = this.validator.validate(this.form);
    if (!isFormValid) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.organizations.places.creation.error-messages.submit'),
      });
      return;
    }

    this.isLoading = true;
    await this.args.create(this.form);
    this.isLoading = false;
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

  <template>
    <section class="page-section">
      <div class="places__add-form">
        <form class="form" {{on "submit" this.onSubmit}}>
          <span class="admin-form__mandatory-text">
            {{t "common.forms.mandatory-fields" htmlSafe=true}}
          </span>
          <div class="form-field">
            <PixInput
              @value={{this.form.count}}
              type="number"
              @requiredLabel={{t "common.forms.mandatory"}}
              required={{false}}
              {{on "change" (fn this.handleInputChange "count")}}
              @validationStatus={{if this.validator.errors.count "error"}}
              @errorMessage={{if this.validator.errors.count (t this.validator.errors.count)}}
            ><:label>Nombre :</:label></PixInput>
          </div>
          <div class="form-field">
            <PixInput
              type="date"
              @value={{this.form.activationDate}}
              @requiredLabel={{t "common.forms.mandatory"}}
              required={{false}}
              {{on "change" (fn this.handleInputChange "activationDate")}}
              @validationStatus={{if this.validator.errors.activationDate "error"}}
              @errorMessage={{if this.validator.errors.activationDate (t this.validator.errors.activationDate)}}
            ><:label>Date d'activation</:label></PixInput>
          </div>
          <div class="form-field">
            <PixInput
              type="date"
              @value={{this.form.expirationDate}}
              @requiredLabel={{t "common.forms.mandatory"}}
              required={{false}}
              {{on "change" (fn this.handleInputChange "expirationDate")}}
              @validationStatus={{if this.validator.errors.expirationDate "error"}}
              @errorMessage={{if this.validator.errors.expirationDate (t this.validator.errors.expirationDate)}}
            ><:label>Date d'expiration</:label></PixInput>
          </div>
          <div class="form-field">
            <PixSelect
              @options={{this.categories}}
              @texts={{hash placeholder="Sélectionnez une catégorie" requiredLabel=(t "common.forms.mandatory")}}
              @onChange={{fn this.handleSelectChange "category"}}
              @value={{this.form.category}}
              @validationStatus={{if this.validator.errors.category "error"}}
              @errorMessage={{if this.validator.errors.category (t this.validator.errors.category)}}
            >
              <:label>Catégorie</:label>
            </PixSelect>
          </div>
          <div class="form-field">
            <PixInput
              @value={{this.form.reference}}
              maxlength="255"
              required={{false}}
              @requiredLabel={{t "common.forms.mandatory"}}
              {{on "change" (fn this.handleInputChange "reference")}}
              @validationStatus={{if this.validator.errors.reference "error"}}
              @errorMessage={{if this.validator.errors.reference (t this.validator.errors.reference)}}
            ><:label>Référence</:label></PixInput>
          </div>

          <div class="form-actions">
            <PixButtonLink
              class="action-buttons__cancel"
              @variant="secondary"
              @size="small"
              @route="authenticated.organizations.get.places"
            >
              {{t "common.actions.cancel"}}
            </PixButtonLink>
            <PixButton @type="submit" @size="small" @variant="success" @isLoading={{this.isLoading}}>
              {{t "common.actions.add"}}
            </PixButton>
          </div>
        </form>
      </div>
    </section>
  </template>
}

const PLACES_LOT_FORM_SCHEMA = Joi.object({
  count: Joi.number().integer().positive().required().messages({
    'any.required': 'components.organizations.places.creation.error-messages.count',
    'number.base': 'components.organizations.places.creation.error-messages.count',
    'number.positive': 'components.organizations.places.creation.error-messages.count',
    'number.integer': 'components.organizations.places.creation.error-messages.count',
  }),
  activationDate: Joi.date().required().messages({
    'any.required': 'components.organizations.places.creation.error-messages.activation-date',
  }),
  expirationDate: Joi.date().required().messages({
    'any.required': 'components.organizations.places.creation.error-messages.expiration-date',
  }),
  reference: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.places.creation.error-messages.reference',
    'string.empty': 'components.organizations.places.creation.error-messages.reference',
  }),
  category: Joi.string().required().messages({
    'any.required': 'components.organizations.places.creation.error-messages.category',
  }),
});
