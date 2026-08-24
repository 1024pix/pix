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

const NETWORK_EDIT_FORM_VALIDATION_SCHEMA = Joi.object({
  name: Joi.string().empty(['', null]).max(50).required().messages({
    'any.required': 'components.networks.editing.error-messages.name',
    'string.empty': 'components.networks.editing.error-messages.name',
    'string.max': 'components.networks.editing.error-messages.name-max-length',
  }),
});

export default class NetworkEditForm extends Component {
  @service pixToast;
  @service intl;

  @tracked form = { name: this.args.network.name };

  validator = new FormValidator(NETWORK_EDIT_FORM_VALIDATION_SCHEMA);

  handleInputChange = (key, event) => {
    const { value } = event.target;
    this.validator.validateField(key, value);
    this.form = { ...this.form, [key]: value };
  };

  @action
  async handleSubmit(event) {
    event.preventDefault();

    const isValid = this.validator.validate(this.form);
    if (!isValid) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.networks.editing.notifications.validation-error'),
      });
      return;
    }

    try {
      this.args.network.set('name', this.form.name);
      await this.args.network.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.networks.editing.notifications.success'),
      });
      this.args.hideForm();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.networks.editing.notifications.error'),
      });
      this.args.network.rollbackAttributes();
    }
  }

  <template>
    <form class="admin-form" {{on "submit" this.handleSubmit}}>
      <section class="admin-form__content">
        <div class="network-edit-form__name-input">
          <PixInput
            @id="network-name"
            @value={{this.form.name}}
            @requiredLabel={{t "common.fields.required-field"}}
            required={{true}}
            {{on "change" (fn this.handleInputChange "name")}}
            @errorMessage={{if this.validator.errors.name (t this.validator.errors.name)}}
            @validationStatus={{if this.validator.errors.name "error"}}
          >
            <:label>{{t "components.networks.editing.name.label"}}</:label>
          </PixInput>
        </div>
      </section>
      <section class="admin-form__actions">
        <PixButton @size="small" @variant="secondary" @triggerAction={{@hideForm}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" @size="small" @variant="success">
          {{t "common.actions.save"}}
        </PixButton>
      </section>
    </form>
  </template>
}
