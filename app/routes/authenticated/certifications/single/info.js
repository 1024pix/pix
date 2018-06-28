import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    let store = this.get('store');
    return store.findRecord('certification', params.certification_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('authenticated.certifications.single').set('certificationId', model.get('id'));
  }
});
