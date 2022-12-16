import Route from '@ember/routing/route';

export default class NewBadgeRoute extends Route {
  model() {
    return this.modelFor('authenticated.target-profiles.target-profile');
  }
}
