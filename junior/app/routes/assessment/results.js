import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/utilities/json-api';

export default class ResultRoute extends Route {
  @service router;
  @service store;

  async model() {
    const assessment = await this.modelFor('assessment').reload();
    const { content } = await this.store.request(findRecord('mission', assessment.missionId));
    const mission = content.data;
    return { mission, assessment };
  }
}
