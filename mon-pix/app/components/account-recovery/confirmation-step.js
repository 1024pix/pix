import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ConfirmationStepComponent extends Component {
  @tracked checked = false;

  @action
  onChange(event) {
    this.checked = !!event.target.checked;
  }

  get isFormValid() {
    return this.checked;
  }
}
