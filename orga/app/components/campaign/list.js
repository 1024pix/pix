import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class List extends Component {
  @service router;
  @service intl;

  get caption() {
    if (this.router.currentRouteName === 'campaigns.my-campaigns') {
      return this.intl.t('pages.campaigns-list.table.description-my-campaigns');
    } else {
      return this.intl.t('pages.campaigns-list.table.description-all-campaigns');
    }
  }
}
