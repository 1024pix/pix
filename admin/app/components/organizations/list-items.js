import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ActionsOnUsersRoleInOrganization extends Component {
  @service notifications;

  @tracked showModal = false;
  @tracked organizationToDetach;

  @action
  openModal(organization) {
    this.showModal = true;
    this.organizationToDetach = organization;
  }

  @action
  closeModal() {
    this.showModal = false;
    this.organizationToDetach = null;
  }

  @action
  async detachOrganizations(organizationId) {
    await this.args.detachOrganizations(organizationId);
    this.closeModal();
  }
}
