import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResultsRoute extends Route {
  @service router;

  model() {
    return this.modelFor('assessments').reload();
  }

  async afterModel(assessment) {
    if (assessment.isCertification) {
      this.router.transitionTo('authenticated');
      return;
    }
  }
}
