import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkRoute extends Route {
  @service router;
  model() {
    return this.modelFor('authenticated.certification-frameworks.item');
  }

  redirect(model) {
    if (model.frameworkKey === 'CLEA') {
      this.router.transitionTo('authenticated.certification-frameworks.item.target-profile');
    }
  }
}
