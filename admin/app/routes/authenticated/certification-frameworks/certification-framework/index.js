import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ItemRoute extends Route {
  @service store;
  @service router;

  redirect(model) {
    if (model.frameworkKey === 'CLEA') {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework.target-profile');
    }
  }
}
