import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('certificationDetails', params.certification_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('authenticated.certifications.single').set('certificationId', model.get('id'));
  }
});
