import Component from '@glimmer/component';
import { service } from '@ember/service';

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

  get labels() {
    return {
      ASSESSMENT: 'components.campaign.type.explanation.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.explanation.PROFILES_COLLECTION',
    };
  }
}
