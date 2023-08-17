import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Header extends Component {
  @service intl;

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.campaigns',
        label: this.intl.t('navigation.main.campaigns'),
      },
      {
        route: 'authenticated.campaigns.campaign.activity',
        label: this.args.campaign.name,
        model: this.args.campaign.id,
      },
    ];
  }
}
