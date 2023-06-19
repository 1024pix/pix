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

  get actionBarId() {
    return guidFor(this) + 'actionBar';
  }

  get paginationId() {
    return guidFor(this) + 'pagination';
  }

  @action
  async deleteParticipants(selectedParticipants, reset) {
    await this.args.deleteParticipants(selectedParticipants);
    reset();
  }
}
