import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CampaignParticipation extends Component {
  @service accessControl;
  @service notifications;

  @tracked displayRemoveParticipationModal = false;
  @tracked participationToDelete = null;

  @action
  toggleDisplayRemoveParticipationModal(participation) {
    this.participationToDelete = participation;
    this.displayRemoveParticipationModal = !this.displayRemoveParticipationModal;
  }

  @action
  async removeParticipation() {
    try {
      await this.args.removeParticipation(this.participationToDelete);
    } finally {
      this.toggleDisplayRemoveParticipationModal();
    }
  }
}
