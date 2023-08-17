import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ParticipantsList extends Component {
  @service notifications;
  @service currentUser;
  @service store;
  @service intl;

  @tracked isModalOpen;
  @tracked participationToDelete;

  constructor() {
    super(...arguments);
    this.isModalOpen = false;
  }

  get canDeleteParticipation() {
    return this.currentUser.isAdminInOrganization || this.args.campaign.ownerId == this.currentUser.prescriber?.id;
  }

  @action
  openModal(participation, event) {
    event.stopPropagation();
    this.isModalOpen = true;
    this.participationToDelete = participation;
  }

  @action
  closeModal() {
    this.participationToDelete = null;
    this.isModalOpen = false;
  }

  @action
  deleteCampaignParticipation() {
    this.isModalOpen = false;
    this.args.deleteCampaignParticipation(this.args.campaign.id, this.participationToDelete);
    this.participationToDelete = null;
  }
}
