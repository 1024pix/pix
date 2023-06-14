import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class List extends Component {
  @action
  onClick(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }

  get mainCheckboxId() {
    return guidFor(this);
  }

  get mainCheckbox() {
    return document.getElementById(this.mainCheckboxId);
  }
}
