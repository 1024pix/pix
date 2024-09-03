import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionDetailsRoute extends Route {
  @service currentUser;
  @service router;
  @service store;

  async model(params) {
    const missionId = params.mission_id;
    const organizationId = this.currentUser.organization.id;
    const mission = await this.store.queryRecord('mission', { missionId, organizationId });
    return { mission };
  }
}
