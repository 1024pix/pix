import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class UpdateAutonomousCourseForm extends Component {
  constructor() {
    super(...arguments);
  }

  @action
  updateAutonomousCourseValue(key, event) {
    this.args.autonomousCourse[key] = event.target.value;
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.update();
  }

  noop() {}
}
