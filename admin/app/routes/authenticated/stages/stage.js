import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class StageRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('stage', params.stage_id);
  }
}
