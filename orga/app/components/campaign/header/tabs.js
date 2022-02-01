import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CampaignTabs extends Component {
  @service currentUser;

  get downloadUrl() {
    return this.args.campaign.urlToResult + `&lang=${this.currentUser.prescriber.lang}`;
  }
}
