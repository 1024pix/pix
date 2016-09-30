import Ember from 'ember';
import RSVP from 'rsvp';
import DS from 'ember-data';

export default Ember.Route.extend({

  model(params) {
    const store = this.get('store');
    return RSVP.hash({
      assessment: store.findRecord('assessment', params.assessment_id),
      challenge: store.findRecord('challenge', params.challenge_id)
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);

    const progressToSet = model.assessment
      .get('course')
      .then((course) => course.getProgress(model.challenge));

    controller.set('progress', DS.PromiseObject.create({ promise: progressToSet }));
  },

  serialize: function (model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  }

});
