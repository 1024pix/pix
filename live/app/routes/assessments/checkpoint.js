import Route from '@ember/routing/route';

export default Route.extend({

  actions: {
    resumeAssessment(assessment) {
      this.transitionTo('assessments.resume', assessment.get('id'));
    },

    openComparison(assessment_id, answer_id, index) {
      this.transitionTo('assessments.comparison', assessment_id, answer_id, index);
    }
  }
});
