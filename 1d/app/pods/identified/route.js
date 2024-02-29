import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { styleToolkit } from '../../utils/layout';

export default class IdentifiedRoute extends Route {
  @service router;
  @service currentLearner;

  async beforeModel() {
    if (!this.currentLearner.learner) {
      this.router.transitionTo('organization-code');
    }
    styleToolkit.backgroundBlob.reset();
  }

  async model() {
    const currentLearner = this.currentLearner.learner;
    return {
      studentsUrl: `${currentLearner.schoolUrl}/students?division=${currentLearner.division}`,
    };
  }
}
