import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class List extends Component {
  @tracked showDeletionModal = false;

  @service currentUser;

  get showCheckbox() {
    return this.currentUser.isAdminInOrganization;
  }

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

  get hasParticipants() {
    return Boolean(this.args.participants.length);
  }

  @action
  openDeletionModal() {
    this.showDeletionModal = true;
  }

  @action
  closeDeletionModal() {
    this.showDeletionModal = false;
  }

  @action
  async deleteParticipants(selectedParticipants, resetParticipants) {
    await this.args.deleteParticipants(selectedParticipants);
    this.closeDeletionModal();
    resetParticipants();
  }

  @action
  async addResetOnFunction(wrappedFunction, resetParticipants, ...args) {
    await wrappedFunction(...args);
    resetParticipants();
  }

  @action
  addStopPropagationOnFunction(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }
}
