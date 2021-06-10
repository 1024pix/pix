import Route from '@ember/routing/route';

export default class ActivityRoute extends Route {

  model() {
    return this.modelFor('authenticated.campaigns.campaign');
  }
}
