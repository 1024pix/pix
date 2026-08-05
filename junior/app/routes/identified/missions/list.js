import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionsRoute extends Route {
  @service store;
  @service storeRequest;
  //TODO rename this service
  @service currentLearner;

  async model() {
    const { content } = await this.storeRequest.query('mission');
    const missions = content.data;
    const { content: organizationLearnerContent } = await this.storeRequest.findRecord(
      'organization-learner',
      this.currentLearner.learner.id,
    );
    const organizationLearner = organizationLearnerContent.data;
    return {
      missions,
      organizationLearner,
    };
  }
}
