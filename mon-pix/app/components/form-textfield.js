import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

const INPUT_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input--default',
  error: 'form-textfield__input--error',
  success: 'form-textfield__input--success',
};

const ICON_TYPE_STATUS_MAP = {
  default: '',
  error: 'error',
  success: 'success',
};

const MESSAGE_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__message--default',
  error: 'form-textfield__message--error',
  success: 'form-textfield__message--success',
};

const INPUT_CONTAINER_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input-container--default',
  error: 'form-textfield__input-container--error',
  success: 'form-textfield__input-container--success',
};

export default class FormTextfield extends Component {
  @tracked isPasswordVisible = false;

  onValidate;

  constructor() {
    super(...arguments);
    this.onValidate = this.args.onValidate || (() => {});
  }

  get isPassword() {
    return this.args.textfieldName === 'password';
  }

  get isEmail() {
    return this.args.textfieldName === 'email';
  }

  get textfieldType() {
    switch (this.args.textfieldName) {
      case 'password':
        return this.isPasswordVisible ? 'text' : 'password';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  }

  get hasIcon() {
    return this._isValidationStatusNotDefault() && !this.args.disabled;
  }

  _isValidationStatusNotDefault() {
    return this.args.validationStatus !== 'default';
  }

  get displayMessage() {
    return !isEmpty(this.args.validationMessage) || this.hasIcon;
  }

  get inputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.validationStatus] || null;
  }

  get iconType() {
    return ICON_TYPE_STATUS_MAP[this.args.validationStatus] || '';
  }

  get inputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.validationStatus] || '';
  }

  get validationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.validationStatus] || '';
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    const InputElement = document.getElementById('password');
    if (InputElement) {
      InputElement.focus();
    }
  }
}
