import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  afterModel(model) {
    if (model.get('isCertification')) {
      this.transitionTo('index');
    }
  },

  actions: {
    openComparison(assessment_id, answer_id, index) {
      this.transitionTo('assessments.comparison', assessment_id, answer_id, index);
    }
  }

});
