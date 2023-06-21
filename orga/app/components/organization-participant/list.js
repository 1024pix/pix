import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class List extends Component {
  get headerId() {
    return guidFor(this) + 'mainCheckbox';
  }

  get actionBarId() {
    return guidFor(this) + 'actionBar';
  }

  get paginationId() {
    return guidFor(this) + 'pagination';
  }

  get filtersId() {
    return guidFor(this) + 'filters';
  }

  @action
  async deleteParticipants(selectedParticipants, reset) {
    await this.args.deleteParticipants(selectedParticipants);
    reset();
  }

  @action
  async addResetOnFunction(func, reset, ...args) {
    await func(...args);
    reset();
  }

  @action
  onClick(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }
}
