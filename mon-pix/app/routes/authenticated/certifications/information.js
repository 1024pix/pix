import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InformationRoute extends Route {
  @service store;

  async model(params) {
    return this.store.peekRecord('certification-candidate', params.certification_candidate_id);
  }
}
