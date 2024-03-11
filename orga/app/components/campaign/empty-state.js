import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class EmptyState extends Component {
  @service url;

  get campaignUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaignCode}`;
  }
}
