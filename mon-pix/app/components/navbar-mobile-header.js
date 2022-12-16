/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

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
