import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SessionRoute extends Route {
  @service notifications;

  setupController(controller, model) {
    super.setupController(controller, model);
    this.controllerFor('authenticated.sessions.session').inputId = model.id;
  }

  @action
  error(anError) {
    this.notifications.error(anError);
    this.transitionTo('authenticated.sessions.list');
  }
}
