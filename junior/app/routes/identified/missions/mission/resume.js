import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { postQuery } from '@warp-drive/utilities/json-api';

export default class MissionResumeRoute extends Route {
  @service router;
  @service store;
  @service currentLearner;

  async model() {
    const mission = this.modelFor('identified.missions.mission');
    const { content } = await this.store.request(
      postQuery('assessment', {
        missionId: mission.id,
        learnerId: this.currentLearner.learner.id,
      }),
    );
    return content.data;
  }

  afterModel(assessment) {
    return this.router.replaceWith('assessment.challenge', assessment);
  }
}
