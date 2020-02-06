import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { isEmpty } from '@ember/utils';

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

export default Component.extend({
  classNames: ['form-textfield'],

  label: '',
  textfieldName: '',
  validationMessage: '',
  validationStatus: 'default',
  isPassword: equal('textfieldName','password'),
  isEmail: equal('textfieldName','email'),
  isPasswordVisible: false,
  require: false,
  help: '',
  disabled: false,

  onValidate: () => {},

  textfieldType: computed('textfieldName', 'isPasswordVisible',  function() {
    if (this.textfieldName === 'password') {
      return this.isPasswordVisible ? 'text' : 'password';
    }
    if (this.textfieldName === 'email') {
      return 'email';
    }
    return 'text';
  }),

  _isValidationStatusNotDefault() {
    return this.validationStatus !== 'default';
  },

  hasIcon: computed('validationStatus', 'user.errors.content', 'disabled', function() {
    return this._isValidationStatusNotDefault() && !this.disabled;
  }),

  displayMessage: computed('hasIcon', 'validationMessage', function() {
    return !isEmpty(this.validationMessage) || this.hasIcon;
  }),

  inputContainerStatusClass: computed('validationStatus', function() {
    const inputValidationStatus = this.validationStatus;
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[inputValidationStatus] || null;
  }),

  iconType: computed('validationStatus', function() {
    const inputValidationStatus = this.validationStatus;
    return ICON_TYPE_STATUS_MAP[inputValidationStatus] || '';
  }),

  inputValidationStatus: computed('validationStatus', function() {
    const inputValidationStatus = this.validationStatus;
    return INPUT_VALIDATION_STATUS_MAP[inputValidationStatus] || '';
  }),

  validationMessageClass: computed('validationStatus', function() {
    const inputValidationStatus = this.validationStatus;
    return MESSAGE_VALIDATION_STATUS_MAP[inputValidationStatus] || '';
  }),

  actions: {
    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    }
  }
});
