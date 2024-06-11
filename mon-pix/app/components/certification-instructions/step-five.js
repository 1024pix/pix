import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class StepFive extends Component {
  @tracked checked = false;

  @action
  onChange(event) {
    this.checked = !!event.target.checked;
    this.args.enableNextButton(this.checked);
  }
}
