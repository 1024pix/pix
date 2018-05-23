import Route from '@ember/routing/route';

export default Route.extend({

  actions: {
    resumeAssessment(assessment) {
      this.transitionTo('assessments.resume', assessment.get('id'));
    }
  }
});
