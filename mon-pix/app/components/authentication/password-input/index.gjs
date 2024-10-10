import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import PasswordChecklist from './password-checklist';

const CONTAINS_UPPERCASE_KEY = 'containsUppercase';
const CONTAINS_LOWERCASE_KEY = 'containsLowercase';
const CONTAINS_DIGIT_KEY = 'containsDigit';
const MIN_LENGTH_KEY = 'minLength';

export default class PasswordInput extends Component {
  @service intl;

  @tracked errors = [];
  @tracked validationStatus = 'default';
  @tracked value = '';

  get hasValidationStatusError() {
    return this.validationStatus === 'error';
  }

  get rules() {
    return [
      {
        key: MIN_LENGTH_KEY,
        description: this.intl.t('components.authentication.password-input.rules.min-length'),
      },
      {
        key: CONTAINS_UPPERCASE_KEY,
        description: this.intl.t('components.authentication.password-input.rules.contains-uppercase'),
      },
      {
        key: CONTAINS_LOWERCASE_KEY,
        description: this.intl.t('components.authentication.password-input.rules.contains-lowercase'),
      },
      {
        key: CONTAINS_DIGIT_KEY,
        description: this.intl.t('components.authentication.password-input.rules.contains-digit'),
      },
    ];
  }

  checkRules() {
    const errors = [];
    const hasDigit = (value) => /\d/.test(value);
    const hasLowercase = (value) => /[a-zà-ÿ]/.test(value);
    const hasUppercase = (value) => /[A-ZÀ-ß]/.test(value);
    const hasMinLength = (value) => value.length && value.length >= 8;
    const value = this.value;

    if (!hasDigit(value)) errors.push(CONTAINS_DIGIT_KEY);
    if (!hasLowercase(value)) errors.push(CONTAINS_LOWERCASE_KEY);
    if (!hasUppercase(value)) errors.push(CONTAINS_UPPERCASE_KEY);
    if (!hasMinLength(value)) errors.push(MIN_LENGTH_KEY);

    return errors;
  }

  @action
  handlePasswordChange(event) {
    this.value = event.target.value;
    this.errors = this.checkRules();

    if (this.value && this.errors.length === 0) {
      this.validationStatus = 'success';
    }

    const { onInput } = this.args;
    if (onInput) onInput(event);
  }

  @action
  handleValidationStatus() {
    if (!this.value || this.errors.length > 0) {
      this.validationStatus = 'error';
    }
  }

  <template>
    <PixInputPassword
      aria-describedby="password-checklist"
      aria-invalid={{this.hasValidationStatusError}}
      autocomplete="new-password"
      name="password"
      @errorMessage={{t "components.authentication.password-input.error-message"}}
      @id="password"
      @validationStatus={{this.validationStatus}}
      {{on "input" this.handlePasswordChange}}
      {{on "blur" this.handleValidationStatus}}
      ...attributes
    >
      <:label>{{t "pages.sign-in.fields.password.label"}}</:label>
    </PixInputPassword>

    <PasswordChecklist id="password-checklist" @errors={{this.errors}} @rules={{this.rules}} @value={{this.value}} />
  </template>
}
