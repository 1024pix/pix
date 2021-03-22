import Route from '@ember/routing/route';

export default class StageRoute extends Route {

  model(params) {
    return this.store.findRecord('stage', params.stage_id);
  }
}
