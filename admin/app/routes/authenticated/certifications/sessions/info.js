import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('session', params.session_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('authenticated.certifications.sessions').set('sessionId', model.get('id'));
  }
});
