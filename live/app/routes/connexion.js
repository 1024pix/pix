import Ember from 'ember';

export default Ember.Route.extend({

  authentication: Ember.inject.service(),

  actions: {
    signin(email, password) {
      return this.get('store')
        .createRecord('authentication', { email, password })
        .save()
        .then((login) => {
          this.get('authentication').login(login.get('token'));
        });
    }
  }

});
