import Route from '@ember/routing/route';
import Model from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class SharedCertificationRoute extends Route {
  @service router;

  async redirect(model, transition) {
    if (!model || !(model instanceof Model)) {
      if (transition && transition.from) {
        transition.abort();
      } else {
        this.router.replaceWith('/verification-certificat?unallowedAccess=true');
      }
    }
  }
}
