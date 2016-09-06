import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    return this
      .get('store')
      .findRecord('challenge', params.challenge_id);
  }

});
