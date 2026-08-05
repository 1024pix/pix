import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionIntroductionRoute extends Route {
  @service currentLearner;
  @service storeRequest;

  async model() {
    const mission = this.modelFor('identified.missions.mission');
    const { content } = await this.storeRequest.findRecord('organization-learner', this.currentLearner.learner.id);
    const organizationLearner = content.data;
    const learnerHasOralizationFeature = organizationLearner.hasOralizationFeature;
    return { mission, learnerHasOralizationFeature };
  }
}
