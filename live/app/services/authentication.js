import Ember from 'ember';

export default Ember.Service.extend({

  token: '',

  logout() {
    this.set('token', '');
  },

  login(token) {
    this.set('token', token);
  }

});
