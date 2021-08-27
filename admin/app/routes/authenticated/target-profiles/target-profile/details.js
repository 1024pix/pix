import Route from '@ember/routing/route';

export default class TargetProfileDetailsRoute extends Route {
  model() {
    return this.modelFor('authenticated.target-profiles.target-profile');
  }
}
