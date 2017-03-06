import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('assessment', params.assessment_id, { reload: true });
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
