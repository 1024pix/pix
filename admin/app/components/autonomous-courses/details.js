import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Details extends Component {
  @tracked isEditMode = false;

  constructor() {
    super(...arguments);
  }

  @action
  toggleEditMode() {
    if (this.isEditMode) {
      this.args.reset();
    }
    this.isEditMode = !this.isEditMode;
  }

  @action
  async update() {
    this.args.update();
    this.isEditMode = false;
  }
}
