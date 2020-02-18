import { on } from '@ember/object/evented';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  EKMixin as EmberKeyboardMixin,
  keyDown
} from 'ember-keyboard';

export default Component.extend(EmberKeyboardMixin, {

  currentUser: service(),
  routing: service('-routing'),

  classNames: ['logged-user-details'],

  keyboardActivated: true,
  _canDisplayMenu: false,

  canDisplayLinkToProfile: computed('routing.currentRouteName', function() {
    const currentRouteName = this.get('routing.currentRouteName');

    return currentRouteName !== 'profile';
  }),

  displayedIdentifier: computed('currentUser.user.email', function() {
    return this.currentUser.user.email ? this.currentUser.user.email : this.currentUser.user.username;
  }),

  closeOnEsc: on(keyDown('Escape'), function() {
    this.set('_canDisplayMenu', false);
  }),

  actions: {
    toggleUserMenu() {
      this.toggleProperty('_canDisplayMenu');
    },

    closeMenu() {
      this.set('_canDisplayMenu', false);
    }
  }
});
