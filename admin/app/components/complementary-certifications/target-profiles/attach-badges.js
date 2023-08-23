import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AttachBadges extends Component {
  @action
  onUpdateLevel(event) {
    this.args.onUpdateLevel(event.target.id, event.target.value);
  }
}
