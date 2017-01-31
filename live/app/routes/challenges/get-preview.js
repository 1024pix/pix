import Ember from 'ember';
import RSVP from 'rsvp';
import getChallengeType from '../../utils/get-challenge-type';

export default Ember.Route.extend({

  model(params) {
    const store = this.get('store');
    const challengePromise = store.findRecord('challenge', params.challenge_id);

    return RSVP.hash({
      challenge: challengePromise
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    const challengeType =  getChallengeType(model.challenge.get('type'));
    controller.set('challengeItemType', 'challenge-item-' + challengeType);
  }

});
