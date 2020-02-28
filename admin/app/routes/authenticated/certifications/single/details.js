import Route from '@ember/routing/route';

export default class DetailsRoute extends Route {

  model(params) {
    return this.store.findRecord('certificationDetails', params.certification_id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    this.controllerFor('authenticated.certifications.single').set('certificationId', model.get('id'));
  }
}
