import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('navbar-desktop-header')
export default class NavbarDesktopHeader extends Component {
  @service router;
  @service session;

  _canDisplayMenu = false;

  _menuItems = [
    { name: 'Se connecter', link: 'login', class: 'navbar-menu-signin-link' },
    { name: 'S’inscrire', link: 'inscription', class: 'navbar-menu-signup-link' }
  ];

  @alias('session.isAuthenticated')
  isUserLogged;

  @computed('isUserLogged')
  get menu() {
    const menuItems = this._menuItems;
    return this.isUserLogged ? menuItems.filterBy('permanent', true) : menuItems;
  }
}
