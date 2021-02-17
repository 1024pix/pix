import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';

export default class NavbarDesktopHeader extends Component {
  @service router;
  @service session;
  @service intl;
  @service currentUser;

  @tracked isUserLogged = this.session.isAuthenticated;

  get menu() {
    return (this.isUserLogged || this._isExternalUser) ? [] : this._menuItems;
  }

  get _menuItems() {
    return [
      { name: this.intl.t('navigation.not-logged.sign-in'), link: 'login', class: 'navbar-menu-signin-link' },
      { name: this.intl.t('navigation.not-logged.sign-up'), link: 'inscription', class: 'navbar-menu-signup-link' },
    ];
  }

  get _isExternalUser() {
    return this.session.get('data.externalUser');
  }

  get showDashboard() {
    return ENV.APP.FT_DASHBOARD;
  }

  get showHeaderMenuItem() {
    return this.isUserLogged && !this.currentUser.user.isAnonymous;
  }
}
