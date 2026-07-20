import Route from '@ember/routing/route';

export default class TargetProfileIndexRoute extends Route {
  model() {
    return this.modelFor('authenticated.certification-frameworks.certification-framework.target-profile');
  }
}
