import Ember from 'ember';

export default Ember.Component.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  classNames: ['navbar-header'],
  _canDisplayMenu: false,

  isUserLogged: Ember.computed('session', function() {
    return this.get('session.isAuthenticated');
  })

});
