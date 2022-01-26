import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class UpdateForm extends Component {
  get campaignOwnerOptions() {
    if (!this.args.membersSortedByFullName) return [];

    return this.args.membersSortedByFullName.map((member) => {
      return { value: member.get('id'), label: member.get('fullName') };
    });
  }

  @action
  selectOwner(event) {
    const newOwnerFullName = event.target.value;
    const selectedMember = this.args.membersSortedByFullName.find(
      (member) => newOwnerFullName === member.get('fullName')
    );
    if (selectedMember) {
      this.args.campaign.ownerId = selectedMember.get('id');
    }
  }

  @action
  onChangeCampaignName(event) {
    this.args.campaign.name = event.target.value?.trim();
  }

  @action
  onChangeCampaignTitle(event) {
    this.args.campaign.title = event.target.value?.trim();
  }
}
