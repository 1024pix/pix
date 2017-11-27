import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['certification-banner'],
  user: null,

  fullname: Ember.computed('user', function() {
    return `${this.get('user.firstName')} ${ this.get('user.lastName')}`;
  })

});
