import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StartRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('certification-candidate-subscription', params.certification_candidate_id);
  }
}
