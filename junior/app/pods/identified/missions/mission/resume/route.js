import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionRoute extends Route {
  @service router;
  @service store;
  @service currentLearner;

  model(params, transition) {
    return this.store.queryRecord('assessment', {
      missionId: transition.to.parent.params.mission_id,
      learnerId: this.currentLearner.learner.id,
    });
  }

  afterModel(assessment) {
    return this.router.replaceWith('assessment.challenge', assessment);
  }
}
