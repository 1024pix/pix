import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionRoute extends Route {
  @service errorNotifier;
  @service router;
  @service store;

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.inputId = model.id;
  }

  model(params) {
    return this.store.findRecord('session', params.session_id);
  }

  @action
  error(anError) {
    this.errorNotifier.notify(anError);
    this.router.transitionTo('authenticated.sessions.list');
  }
}
