import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class List extends Component {
  @action
  onClick(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }
}
