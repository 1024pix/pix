import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';

import { FormValidator } from '../../../utils/form-validator';

const CREDITS_LOT_FORM_SCHEMA = Joi.object({
  count: Joi.number().integer().positive().required().messages({
    'any.required': 'components.organizations.credits.creation.error-messages.count',
    'number.base': 'components.organizations.credits.creation.error-messages.count',
    'number.positive': 'components.organizations.credits.creation.error-messages.count',
    'number.integer': 'components.organizations.credits.creation.error-messages.count',
  }),
  activationDate: Joi.date().required().messages({
    'any.required': 'components.organizations.credits.creation.error-messages.activation-date',
    'date.base': 'components.organizations.credits.creation.error-messages.activation-date',
  }),
  expirationDate: Joi.date().required().greater(Joi.ref('activationDate')).messages({
    'any.required': 'components.organizations.credits.creation.error-messages.expiration-date',
    'date.base': 'components.organizations.credits.creation.error-messages.expiration-date',
    'date.greater': 'components.organizations.credits.creation.error-messages.expiration-date-too-early',
  }),
  reference: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.organizations.credits.creation.error-messages.reference',
    'string.empty': 'components.organizations.credits.creation.error-messages.reference',
  }),
});

export default class LotCreationForm extends Component {
  @tracked form = {
    count: undefined,
    activationDate: new Date().toISOString().split('T')[0],
    expirationDate: undefined,
    reference: undefined,
  };

  validator = new FormValidator(CREDITS_LOT_FORM_SCHEMA);

  @action
  async onSubmit(event) {
    event.preventDefault();

    if (!this.validator.validate(this.form)) return;

    await this.args.onSubmit(this.form);
  }

  @action
  handleInputChange(key, event) {
    this.form = { ...this.form, [key]: event.target.value };
  }

  <template>
    <form class="credits-lot-form" {{on "submit" this.onSubmit}}>
      <div class="form-field">
        <PixInput
          type="number"
          @value={{this.form.count}}
          @requiredLabel={{t "common.forms.mandatory"}}
          required={{false}}
          {{on "change" (fn this.handleInputChange "count")}}
          @validationStatus={{if this.validator.errors.count "error"}}
          @errorMessage={{if this.validator.errors.count (t this.validator.errors.count)}}
        >
          <:label>{{t "components.organizations.credits.creation.labels.count"}}</:label>
        </PixInput>
      </div>

      <div class="credits-lot-form__dates">
        <div class="form-field">
          <PixInput
            type="date"
            @value={{this.form.activationDate}}
            @requiredLabel={{t "common.forms.mandatory"}}
            required={{false}}
            {{on "change" (fn this.handleInputChange "activationDate")}}
            @validationStatus={{if this.validator.errors.activationDate "error"}}
            @errorMessage={{if this.validator.errors.activationDate (t this.validator.errors.activationDate)}}
          >
            <:label>{{t "components.organizations.credits.creation.labels.activation-date"}}</:label>
          </PixInput>
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
          >
            <:label>{{t "components.organizations.credits.creation.labels.expiration-date"}}</:label>
          </PixInput>
        </div>
      </div>

      <div class="form-field">
        <PixInput
          maxlength="255"
          @value={{this.form.reference}}
          @requiredLabel={{t "common.forms.mandatory"}}
          required={{false}}
          {{on "change" (fn this.handleInputChange "reference")}}
          @validationStatus={{if this.validator.errors.reference "error"}}
          @errorMessage={{if this.validator.errors.reference (t this.validator.errors.reference)}}
        >
          <:label>{{t "components.organizations.credits.creation.labels.reference"}}</:label>
        </PixInput>
      </div>

      <div class="credits-lot-form__actions">
        <PixButton @type="submit" @variant="primary" @isLoading={{@isLoading}}>
          {{t "common.actions.add"}}
        </PixButton>
      </div>
    </form>
  </template>
}
