import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionDetailsRoute extends Route {
  @service storeRequest;

  async model(params) {
    const { content } = await this.storeRequest.findRecord('mission', params.mission_id);
    return content.data;
  }
}
