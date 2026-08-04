import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/utilities/json-api';

export default class MissionsRoute extends Route {
  @service store;
  //TODO rename this service
  @service currentLearner;

  async model() {
    const missions = await this.store.findAll('mission');
    const { content: organizationLearnerContent } = await this.store.request(
      findRecord('organization-learner', this.currentLearner.learner.id),
    );
    const organizationLearner = organizationLearnerContent.data;
    return {
      missions,
      organizationLearner,
    };
  }
}
