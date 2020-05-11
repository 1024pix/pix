import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class NavbarDesktopHeader extends Component {
  @service router;
  @service session;

  _menuItems = [
    { name: 'Se connecter', link: 'login', class: 'navbar-menu-signin-link' },
    { name: 'S’inscrire', link: 'inscription', class: 'navbar-menu-signup-link' }
  ];

  @alias('session.isAuthenticated') isUserLogged;

  get menu() {
    const menuItems = this._menuItems;
    return this.isUserLogged ? menuItems.filterBy('permanent', true) : menuItems;
  }
}
