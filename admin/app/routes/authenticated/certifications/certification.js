import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CertificationRoute extends Route {
  @service errorNotifier;
  @service accessControl;

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
    this.transitionTo('authenticated.certifications');
  }
}
