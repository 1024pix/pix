import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TargetProfileRoute extends Route {
  @service store;

  async model() {
    return this.modelFor('authenticated.certification-frameworks.certification-framework');
  }
}
