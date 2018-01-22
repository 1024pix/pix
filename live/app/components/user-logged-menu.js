import { on } from '@ember/object/evented';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  EKMixin as EmberKeyboardMixin,
  keyDown
} from 'ember-keyboard';

export default Component.extend(EmberKeyboardMixin, {

  session: service(),
  store: service(),
  routing: service('-routing'),

  classNames: ['logged-user-details'],

  keyboardActivated: true,
  _canDisplayMenu: false,
  _user: null,

  canDisplayLinkToProfile: computed(function() {
    return this.get('routing.currentRouteName') !== 'compte' && this.get('routing.currentRouteName') !== 'board';
  }),

  init() {
    this._super(...arguments);
    this.get('store').findRecord('user', this.get('session.data.authenticated.userId'))
      .then((user) => this.set('_user', user));
  },

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
