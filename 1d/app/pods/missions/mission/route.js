import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('mission', params.mission_id);
  }
}
