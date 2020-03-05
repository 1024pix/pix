import Route from '@ember/routing/route';

export default class ParametersRoute extends Route {
  model() {
    return this.modelFor('authenticated.campaigns.details');
  }
}
