import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class GetRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('organization', params.organization_id, { reload: true });
  }
}
