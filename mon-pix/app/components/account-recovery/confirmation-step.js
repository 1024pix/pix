import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ConfirmationStepComponent extends Component {
  @tracked checked = false;

  get isFormValid() {
    return this.checked;
  }
}
