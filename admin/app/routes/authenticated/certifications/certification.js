import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationRoute extends Route {
  @service errorNotifier;
  @service accessControl;
  @service router;
  @service store;

  model(params) {
    return this.store.findRecord('certification', params.certification_id);
  }

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isCertif', 'isSupport'], 'authenticated');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.inputId = model.id;
  }

  @action
  error(anError) {
    this.errorNotifier.notify(anError);
    this.router.transitionTo('authenticated.certifications');
  }
}
