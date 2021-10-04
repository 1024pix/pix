import Route from '@ember/routing/route';

export default class NewBadgeRoute extends Route {
  model() {
    return {
      targetProfileId: this.modelFor('authenticated.target-profiles.target-profile').id,
    };
  }
}
