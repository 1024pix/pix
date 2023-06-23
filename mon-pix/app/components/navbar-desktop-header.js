import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class NavbarDesktopHeader extends Component {
  @service router;
  @service session;
  @service intl;
  @service currentUser;

  get isUserLogged() {
    return this.session.isAuthenticated;
  }

  get menu() {
    return this.isUserLogged || this._isExternalUser ? [] : this._menuItems;
  }

  get _menuItems() {
    return [
      {
        name: this.intl.t('navigation.not-logged.sign-in'),
        link: 'authentication.login',
        class: 'navbar-menu-signin-link',
      },
      { name: this.intl.t('navigation.not-logged.sign-up'), link: 'inscription', class: 'navbar-menu-signup-link' },
    ];
  }

  get _isExternalUser() {
    return this.session.get('data.externalUser');
  }

  get showHeaderMenuItem() {
    return this.isUserLogged && !this.currentUser.user.isAnonymous;
  }

  get showMyTrainingsLink() {
    return this.currentUser.user.hasRecommendedTrainings;
  }
}
