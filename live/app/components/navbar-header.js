import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['navbar-header'],
  user: null,

  isUserLogged: Ember.computed('user', function() {
    const user = this.get('user');
    return Ember.isPresent(user);
  })
});
