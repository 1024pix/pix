import Component from '@glimmer/component';

const INPUT_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input--default',
  error: 'form-textfield__input--error',
  success: 'form-textfield__input--success',
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

export default class FormTextfieldDate extends Component {
  get dayHasIcon() {
    return this.args.dayValidationStatus !== 'default' && !this.args.disabled;
  }

  get monthHasIcon() {
    return this.args.monthValidationStatus !== 'default' && !this.args.disabled;
  }

  get yearHasIcon() {
    return this.args.yearValidationStatus !== 'default' && !this.args.disabled;
  }

  get dayInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.dayValidationStatus] || null;
  }

  get monthInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.monthValidationStatus] || null;
  }

  get yearInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.yearValidationStatus] || null;
  }

  get dayInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.dayValidationStatus] || '';
  }

  get monthInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.monthValidationStatus] || '';
  }

  get yearInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.yearValidationStatus] || '';
  }

  get dayValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.dayValidationStatus] || '';
  }

  get monthValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.monthValidationStatus] || '';
  }

  get yearValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.yearValidationStatus] || '';
  }
}
