import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class List extends Component {
  @service intl;

  get caption() {
    if (this.args.allCampaignsContext) {
      return this.intl.t('pages.campaigns-list.table.description-all-campaigns');
    } else {
      return this.intl.t('pages.campaigns-list.table.description-my-campaigns');
    }
  }
}
