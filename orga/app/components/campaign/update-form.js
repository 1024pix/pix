import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class UpdateForm extends Component {
  @action
  onChangeCampaignName(event) {
    this.args.campaign.name = event.target.value?.trim();
  }

  @action
  onChangeCampaignTitle(event) {
    this.args.campaign.title = event.target.value?.trim();
  }
}
