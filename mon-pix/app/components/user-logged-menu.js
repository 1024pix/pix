import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { on } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import {
  EKMixin as EmberKeyboardMixin,
  keyDown
} from 'ember-keyboard';

@classic
@classNames('logged-user-details')
export default class UserLoggedMenu extends Component.extend(EmberKeyboardMixin) {
  @service currentUser;
  @service('-routing') routing;

  keyboardActivated = true;
  _canDisplayMenu = false;

  @computed('routing.currentRouteName')
  get canDisplayLinkToProfile() {
    const currentRouteName = this.routing.currentRouteName;

    return currentRouteName !== 'profile';
  }

  @computed('currentUser.user.email')
  get displayedIdentifier() {
    return this.currentUser.user.email ? this.currentUser.user.email : this.currentUser.user.username;
  }

  @on(keyDown('Escape'))
  closeOnEsc() {
    this.set('_canDisplayMenu', false);
  }

  @action
  toggleUserMenu() {
    this.toggleProperty('_canDisplayMenu');
  }

  @action
  closeMenu() {
    this.set('_canDisplayMenu', false);
  }
}
