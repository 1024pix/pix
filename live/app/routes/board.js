import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store').queryRecord('user', {})
      .then((user) => {
        return user.get('organizations.firstObject');
      })
      .catch(_ => {
        this.transitionTo('index');
      });
  }
});
