import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InformationRoute extends Route {
  @service store;

  async model(params) {
    return await this.store.findRecord('certification-candidate-subscription', params.certification_candidate_id);
  }
}
