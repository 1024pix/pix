import Ember from 'ember';
import { EKMixin as EmberKeyboardMixin, keyDown } from 'ember-keyboard';

export default Ember.Component.extend(EmberKeyboardMixin, {

  session: Ember.inject.service(),
  store: Ember.inject.service(),
  routing: Ember.inject.service('-routing'),

  classNames: ['logged-user-details'],

  keyboardActivated: true,
  _canDisplayMenu: false,
  _user: null,

  canDisplayLinkToProfile: Ember.computed(function() {
    return this.get('routing.currentRouteName') !== 'compte' && this.get('routing.currentRouteName') !== 'board';
  }),

  init() {
    this._super(...arguments);
    this.get('store').findRecord('user', this.get('session.data.authenticated.userId'))
      .then((user) => this.set('_user', user));
  },

  closeOnEsc: Ember.on(keyDown('Escape'), function() {
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
