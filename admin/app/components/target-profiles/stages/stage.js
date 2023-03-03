import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class Stage extends Component {
  @tracked showModal = false;

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  get isDefaultStage() {
    return (
      (this.args.stage.isTypeLevel && this.args.stage.level === 0) ||
      (!this.args.stage.isTypeLevel && this.args.stage.threshold === 0)
    );
  }
}
