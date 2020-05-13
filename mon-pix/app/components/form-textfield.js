import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

const INPUT_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input--default',
  error: 'form-textfield__input--error',
  success: 'form-textfield__input--success'
};

const ICON_TYPE_STATUS_MAP = {
  default: '',
  error: 'error',
  success: 'success'
};

const MESSAGE_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__message--default',
  error: 'form-textfield__message--error',
  success: 'form-textfield__message--success'
};

const INPUT_CONTAINER_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input-container--default',
  error: 'form-textfield__input-container--error',
  success: 'form-textfield__input-container--success'
};

@classic
@classNames('form-textfield')
export default class FormTextfield extends Component {
  label = '';
  textfieldName = '';
  validationMessage = '';
  validationStatus = 'default';

  @equal('textfieldName', 'password')
  isPassword;

  @equal('textfieldName', 'email')
  isEmail;

  isPasswordVisible = false;
  require = false;
  help = '';
  disabled = false;
  onValidate = () => {};

  @computed('textfieldName', 'isPasswordVisible')
  get textfieldType() {
    if (this.textfieldName === 'password') {
      return this.isPasswordVisible ? 'text' : 'password';
    }
    if (this.textfieldName === 'email') {
      return 'email';
    }
    return 'text';
  }

  _isValidationStatusNotDefault() {
    return this.validationStatus !== 'default';
  }

  @computed('validationStatus', 'user.errors.content', 'disabled')
  get hasIcon() {
    return this._isValidationStatusNotDefault() && !this.disabled;
  }

  @computed('hasIcon', 'validationMessage')
  get displayMessage() {
    return !isEmpty(this.validationMessage) || this.hasIcon;
  }

  @computed('validationStatus')
  get inputContainerStatusClass() {
    const inputValidationStatus = this.validationStatus;
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[inputValidationStatus] || null;
  }

  @computed('validationStatus')
  get iconType() {
    const inputValidationStatus = this.validationStatus;
    return ICON_TYPE_STATUS_MAP[inputValidationStatus] || '';
  }

  @computed('validationStatus')
  get inputValidationStatus() {
    const inputValidationStatus = this.validationStatus;
    return INPUT_VALIDATION_STATUS_MAP[inputValidationStatus] || '';
  }

  @computed('validationStatus')
  get validationMessageClass() {
    const inputValidationStatus = this.validationStatus;
    return MESSAGE_VALIDATION_STATUS_MAP[inputValidationStatus] || '';
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
  }
}
