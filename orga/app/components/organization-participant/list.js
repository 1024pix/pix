import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';

export default class List extends Component {
  @service currentUser;

  get isUserAdmin() {
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
  async deleteParticipants(selectedParticipants, resetParticipants) {
    await this.args.deleteParticipants(selectedParticipants);
    resetParticipants();
  }

  @action
  async addResetOnFunction(wrappedFunction, resetParticipants, ...args) {
    await wrappedFunction(...args);
    resetParticipants();
  }

  @action
  onClick(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }
}
