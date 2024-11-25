import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionIntroductionRoute extends Route {
  @service currentLearner;
  @service store;

  async model() {
    const mission = this.modelFor('identified.missions.mission');
    const organizationLearner = await this.store.findRecord('organization-learner', this.currentLearner.learner.id);
    const learnerHasOralizationFeature = organizationLearner.hasOralizationFeature;
    return { mission, learnerHasOralizationFeature };
  }
}
