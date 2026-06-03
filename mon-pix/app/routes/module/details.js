import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModuleDetailsRoute extends Route {
  @service router;

  model() {
    return this.modelFor('module');
  }

  redirect(model) {
    this.router.transitionTo('module.details', model.shortId, model.slug);
  }
}
