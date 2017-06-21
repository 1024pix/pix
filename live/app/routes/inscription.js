import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    // XXX: Model needs to be initialize with empty to handle validations on all fields from Api
    return this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      cgu: false
    });
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }
});
