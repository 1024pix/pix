import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CertificationRoute extends Route {
  @service errorNotifier

  setupController(controller, model) {
    super.setupController(controller, model);
    this.controllerFor('authenticated.certifications').inputId = model.id;
  }

  @action
  error(anError) {
    this.errorNotifier.notify(anError);
    this.transitionTo('authenticated.certifications');
  }
}

