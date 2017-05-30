import Ember from 'ember';

export default Ember.Service.extend({

  token: '',

  logout() {
    this.set('token', '');
  }

});
