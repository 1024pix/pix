import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengePreviewRoute extends Route {
  @service router;
  @service storeRequest;

  async model(params) {
    const { content } = await this.storeRequest.findRecord('challenge', params.challenge_id);
    return content.data;
  }
}
