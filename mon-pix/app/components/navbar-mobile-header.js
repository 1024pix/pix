/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class NavbarMobileHeader extends Component {
  @service session;
  @service currentUser;
  @tracked isMenuOpen = false;

  @alias('session.isAuthenticated') isUserLogged;

  get title() {
    return this.isUserLogged ? this.currentUser.user.fullName : '';
  }

  @action
  openMenu() {
    this.isMenuOpen = true;
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }
}
