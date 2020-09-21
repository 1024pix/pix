import Route from '@ember/routing/route';

export default class DetailsRoute extends Route {

  model() {
    return this.modelFor('authenticated.campaigns.campaign');
  }
}
