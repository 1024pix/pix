import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

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

@classic
@classNames('form-textfield')
export default class FormTextfieldDate extends Component {
  label = '';
  dayTextfieldName = '';
  monthTextfieldName = '';
  yearTextfieldName = '';
  dayValidationMessage = '';
  monthValidationMessage = '';
  yearValidationMessage = '';
  require = false;
  help = '';
  disabled = false;
  onValidateDay = () => {};
  onValidateMonth = () => {};
  onValidateYear = () => {};

  @computed('dayValidationStatus', 'disabled')
  get dayHasIcon() {
    return this.dayValidationStatus !== 'default' && !this.disabled;
  }

  @computed('monthValidationStatus', 'disabled')
  get monthHasIcon() {
    return this.monthValidationStatus !== 'default' && !this.disabled;
  }

  @computed('yearValidationStatus', 'disabled')
  get yearHasIcon() {
    return this.yearValidationStatus !== 'default' && !this.disabled;
  }

  @computed('dayValidationStatus')
  get dayInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.dayValidationStatus] || null;
  }

  @computed('monthValidationStatus')
  get monthInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.monthValidationStatus] || null;
  }

  @computed('yearValidationStatus')
  get yearInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.yearValidationStatus] || null;
  }

  @computed('dayValidationStatus')
  get dayInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.dayValidationStatus] || '';
  }

  @computed('monthValidationStatus')
  get monthInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.monthValidationStatus] || '';
  }

  @computed('yearValidationStatus')
  get yearInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.yearValidationStatus] || '';
  }

  @computed('dayValidationStatus')
  get dayValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.dayValidationStatus] || '';
  }

  @computed('monthValidationStatus')
  get monthValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.monthValidationStatus] || '';
  }

  @computed('yearValidationStatus')
  get yearValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.yearValidationStatus] || '';
  }
}
