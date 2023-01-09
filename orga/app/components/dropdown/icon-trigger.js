import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class IconTrigger extends Component {
  @tracked display = false;

  @action
  toggle(event) {
    event.stopPropagation();
    this.display = !this.display;
  }

  @action
  close() {
    this.display = false;
  }
}
