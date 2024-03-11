import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class ActionChip extends Component {
  @tracked
  isTriggering = false;

  @action
  async triggerAction() {
    if (this.args.triggerAction && !this.isTriggering) {
      this.isTriggering = true;
      await this.args.triggerAction();
    }
    this.isTriggering = false;
  }
}
