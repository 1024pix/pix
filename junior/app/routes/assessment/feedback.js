import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class Feedback extends Route {
  @service router;
  @service storeRequest;

  async model() {
    const assessment = await this.modelFor('assessment').reload();
    const { content } = await this.storeRequest.findRecord('mission', assessment.missionId);
    const mission = content.data;
    return { mission, assessment };
  }
}
