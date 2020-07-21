/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class NavbarDesktopHeader extends Component {
  @service router;
  @service session;
  @service intl;
  _menuItems = [
    { name: this.intl.get('navigation.not-logged.sign-in'), link: 'login', class: 'navbar-menu-signin-link' },
    { name: this.intl.get('navigation.not-logged.sign-up'), link: 'inscription', class: 'navbar-menu-signup-link' }
  ];

  @alias('session.isAuthenticated') isUserLogged;

  get menu() {
    const menuItems = this._menuItems;
    return this.isUserLogged ? menuItems.filterBy('permanent', true) : menuItems;
  }
}
