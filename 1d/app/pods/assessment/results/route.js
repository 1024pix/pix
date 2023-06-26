import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ResultRoute extends Route {
  @service router;
  @service store;

  async model() {
    const assessment = await this.modelFor('assessment');
    const mission = this.store.findRecord('mission', assessment.missionId);

    return mission;
  }
}
