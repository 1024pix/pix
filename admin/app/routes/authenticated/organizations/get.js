import Route from '@ember/routing/route';

export default class GetRoute extends Route {

  model(params) {
    return this.store.findRecord('organization', params.organization_id);
  }
}
