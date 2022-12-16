import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class deleteParticipantModal extends Component {
  @action
  deleteCampaignParticipation() {
    this.args.deleteCampaignParticipant(this.args.campaign.id, this.args.participation);
    this.args.closeModal();
  }
}
