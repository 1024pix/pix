import Route from '@ember/routing/route';

export default class ResultsRoute extends Route {
  model() {
    return this.modelFor('assessments').reload();
  }

  async afterModel(assessment) {
    if (assessment.isCertification) {
      return this.transitionTo('index');
    }
  }
}
