import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return this.get('store').findRecord('assessment', params.assessment_id);
  },

  afterModel(model) {
    return model.get('answers').reload();
  },

  actions: {
    openComparison(assessment_id, answer_id, index) {
      this.transitionTo('assessments.comparison', assessment_id, answer_id, index);
    },
  },
});
