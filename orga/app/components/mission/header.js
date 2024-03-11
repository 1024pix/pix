import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Header extends Component {
  @service intl;
  @service currentUser;
  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.missions',
        label: this.intl.t('navigation.main.missions'),
      },
      {
        route: 'authenticated.missions.details',
        label: this.args.mission.name,
      },
    ];
  }
}
