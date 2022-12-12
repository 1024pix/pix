import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CampaignTabs extends Component {
  @service intl;

  get downloadUrl() {
    return this.args.campaign.urlToResult + `&lang=${this.intl.locale[0]}`;
  }
}
