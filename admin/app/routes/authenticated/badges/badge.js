import Route from '@ember/routing/route';

export default class BadgeRoute extends Route {

  model(params) {
    return this.store.findRecord('badge', params.badge_id);
  }
}
