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
    return guidFor(this) + 'mainCheckbox';
  }

  get mainCheckbox() {
    return document.getElementById(this.mainCheckboxId);
  }

  get actionBarId() {
    return guidFor(this) + 'actionBar';
  }

  get actionBar() {
    return document.getElementById(this.actionBarId);
  }
}
