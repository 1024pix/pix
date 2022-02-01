import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class EmptyState extends Component {
  @service url;

  get campaignUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaignCode}`;
  }
}
