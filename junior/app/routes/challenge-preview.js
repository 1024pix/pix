import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/utilities/json-api';

export default class ChallengePreviewRoute extends Route {
  @service router;
  @service store;

  async model(params) {
    const { content } = await this.store.request(findRecord('challenge', params.challenge_id));
    return content.data;
  }
}
