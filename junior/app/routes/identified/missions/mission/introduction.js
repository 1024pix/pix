import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/utilities/json-api';

export default class MissionIntroductionRoute extends Route {
  @service currentLearner;
  @service store;

  async model() {
    const mission = this.modelFor('identified.missions.mission');
    const { content } = await this.store.request(findRecord('organization-learner', this.currentLearner.learner.id));
    const organizationLearner = content.data;
    const learnerHasOralizationFeature = organizationLearner.hasOralizationFeature;
    return { mission, learnerHasOralizationFeature };
  }
}
