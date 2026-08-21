import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Joi from 'joi';
import { FormValidator } from 'pix-admin/utils/form-validator';

const NETWORK_CREATION_FORM_VALIDATION_SCHEMA = Joi.object({
  name: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.networks.creation.error-messages.name',
    'string.empty': 'components.networks.creation.error-messages.name',
  }),
  organizationId: Joi.string().empty(['', null]).required().messages({
    'any.required': 'components.networks.creation.error-messages.organization-id',
    'string.empty': 'components.networks.creation.error-messages.organization-id',
  }),
});

export default class CreationForm extends Component {
  @service pixToast;
  @service intl;
  @service store;
  @service router;

  @tracked form = {
    name: '',
    organizationId: '',
  };

  validator = new FormValidator(NETWORK_CREATION_FORM_VALIDATION_SCHEMA);

  handleInputChange = (key, event) => {
    const { value } = event.target;
    this.validator.validateField(key, value);
    this.form = { ...this.form, [key]: value };
  };

  focusOnFirstFieldInError = () => {
    const fieldsInError = Object.keys(this.validator.errors);
    const firstHtmlElementInError = document.getElementById(fieldsInError[0]);
    firstHtmlElementInError.focus();
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const isFormValid = this.validator.validate(this.form);
    if (!isFormValid) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.organizations.creation.error-messages.error-toast'),
      });
      this.focusOnFirstFieldInError();
      return;
    }
    const network = await this.createNetwork(this.form);
    if (network) {
      this.router.transitionTo('authenticated.networks.get', network.id);
    }
  };

  @action
  async createNetwork(form) {
    const network = this.store.createRecord('network', { ...form });

    try {
      await network.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.networks.creation.notifications.success'),
      });
      return network;
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('components.networks.creation.notifications.error') });
      network.rollbackAttributes();
    }
  }

  <template>
    <form {{on "submit" this.handleSubmit}} class="network-creation-form">
      <div class="network-creation-form__input network-creation-form__input--full">
        <PixInput
          @id="name"
          @value={{this.form.name}}
          @requiredLabel={{t "common.fields.required-field"}}
          required={{false}}
          {{on "change" (fn this.handleInputChange "name")}}
          @errorMessage={{if this.validator.errors.name (t this.validator.errors.name)}}
          @validationStatus={{if this.validator.errors.name "error"}}
        >
          <:label>{{t "components.networks.creation.name.label"}}</:label>
        </PixInput>
      </div>
      <div class="network-creation-form__input network-creation-form__input--full">
        <PixInput
          @id="organizationId"
          @value={{this.form.organizationId}}
          {{on "change" (fn this.handleInputChange "organizationId")}}
          @requiredLabel={{t "common.fields.required-field"}}
          required={{false}}
          @errorMessage={{if this.validator.errors.organizationId (t this.validator.errors.organizationId)}}
          @validationStatus={{if this.validator.errors.organizationId "error"}}
        >
          <:label>{{t "components.networks.creation.organization-id.label"}}</:label>
        </PixInput>
      </div>
      <PixButton @type="submit" @size="small" @variant="success">
        {{t "components.networks.creation.actions.submit"}}
      </PixButton>
    </form>
  </template>
}
