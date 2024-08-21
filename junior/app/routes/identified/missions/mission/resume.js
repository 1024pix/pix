import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionResumeRoute extends Route {
  @service router;
  @service store;
  @service currentLearner;

  model() {
    const mission = this.modelFor('identified.missions.mission');
    return this.store.queryRecord('assessment', {
      missionId: mission.id,
      learnerId: this.currentLearner.learner.id,
    });
  }

  afterModel(assessment) {
    return this.router.replaceWith('assessment.challenge', assessment);
  }
}
