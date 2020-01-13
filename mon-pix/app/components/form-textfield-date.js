import { computed } from '@ember/object';
import Component from '@ember/component';

const INPUT_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input--default',
  error: 'form-textfield__input--error',
  success: 'form-textfield__input--success'
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
  dayTextfieldName: '',
  monthTextfieldName: '',
  yearTextfieldName: '',
  dayValidationMessage: '',
  monthValidationMessage: '',
  yearValidationMessage: '',
  require: false,
  help: '',
  disabled: false,

  onValidateDay: () => {},
  onValidateMonth: () => {},
  onValidateYear: () => {},

  dayHasIcon: computed('dayValidationStatus', 'disabled', function() {
    return this.dayValidationStatus !== 'default' && !this.disabled;
  }),
  monthHasIcon: computed('monthValidationStatus', 'disabled', function() {
    return this.monthValidationStatus !== 'default' && !this.disabled;
  }),
  yearHasIcon: computed('yearValidationStatus', 'disabled',  function() {
    return this.yearValidationStatus !== 'default' && !this.disabled;
  }),

  dayInputContainerStatusClass: computed('dayValidationStatus', function() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.dayValidationStatus] || null;
  }),
  monthInputContainerStatusClass: computed('monthValidationStatus', function() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.monthValidationStatus] || null;
  }),
  yearInputContainerStatusClass: computed('yearValidationStatus', function() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.yearValidationStatus] || null;
  }),

  dayInputValidationStatus: computed('dayValidationStatus', function() {
    return INPUT_VALIDATION_STATUS_MAP[this.dayValidationStatus] || '';
  }),
  monthInputValidationStatus: computed('monthValidationStatus', function() {
    return INPUT_VALIDATION_STATUS_MAP[this.monthValidationStatus] || '';
  }),
  yearInputValidationStatus: computed('yearValidationStatus', function() {
    return INPUT_VALIDATION_STATUS_MAP[this.yearValidationStatus] || '';
  }),

  dayValidationMessageClass: computed('dayValidationStatus', function() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.dayValidationStatus] || '';
  }),
  monthValidationMessageClass: computed('monthValidationStatus', function() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.monthValidationStatus] || '';
  }),
  yearValidationMessageClass: computed('yearValidationStatus', function() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.yearValidationStatus] || '';
  }),
});
