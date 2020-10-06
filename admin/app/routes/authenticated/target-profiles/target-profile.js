import Route from '@ember/routing/route';

export default class TargetProfileRoute extends Route {

  model(params) {
    return this.store.findRecord('target-profile', params.target_profile_id);
  }
}
