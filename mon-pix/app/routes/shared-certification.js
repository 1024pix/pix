import Route from '@ember/routing/route';
import Model from '@ember-data/model';

export default class SharedCertificationRoute extends Route {

  async redirect(model, transition) {
    if (!model || !(model instanceof Model)) {
      if (transition && transition.from) {
        transition.abort();
      } else {
        this.replaceWith('/verification-certificat?unallowedAccess=true');
      }
    }
  }

}
