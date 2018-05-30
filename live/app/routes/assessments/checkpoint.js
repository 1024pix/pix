import Route from '@ember/routing/route';

export default Route.extend({

  actions: {
    openComparison(assessment_id, answer_id, index) {
      this.transitionTo('assessments.comparison', assessment_id, answer_id, index);
    }
  }
});
