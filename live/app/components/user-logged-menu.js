import Ember from 'ember';

export default Ember.Component.extend({

  session: Ember.inject.service(),
  store: Ember.inject.service(),

  classNames: ['logged-user-details'],

  _canDisplayMenu: false,

  _user: null,

  init() {
    this._super(...arguments);
    this.get('store').findRecord('user', this.get('session.data.authenticated.userId'))
      .then((user) => this.set('_user', user));
  },

  actions: {
    toggleUserMenu() {
      this.toggleProperty('_canDisplayMenu');
    }
  }
});
