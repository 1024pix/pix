import Ember from 'ember';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({
  model(params) {
    return Ember.RSVP.hash({
      assessment: this.store.findRecord('assessment', params.assessment_id, { reload: true })
    });
  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id
    };
  },

  actions: {
    openComparison: function (assessment_id, answer_id, index) {
      this.transitionTo('assessments.get-comparison', assessment_id, answer_id, index);
    }
  }

});
