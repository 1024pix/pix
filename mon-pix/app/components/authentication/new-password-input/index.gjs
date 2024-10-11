import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import PasswordChecklist from './password-checklist';

export default class NewPasswordInput extends Component {
  @tracked value = '';

  get isInvalid() {
    const { validationStatus } = this.args;
    return validationStatus === 'error';
  }

  @action
  handlePasswordChange(event) {
    const { onInput } = this.args;
    this.value = event.target.value;

    if (onInput) onInput(event);
  }

  <template>
    <PixInputPassword
      @id={{@id}}
      @errorMessage={{@errorMessage}}
      @validationStatus={{@validationStatus}}
      {{on "input" this.handlePasswordChange}}
      aria-invalid={{this.isInvalid}}
      aria-describedby="password-checklist"
      autocomplete="new-password"
      ...attributes
    >
      <:label>{{t "components.authentication.new-password-input.label"}}</:label>
    </PixInputPassword>

    <PasswordChecklist id="password-checklist" @rules={{@rules}} @value={{this.value}} />
  </template>
}
