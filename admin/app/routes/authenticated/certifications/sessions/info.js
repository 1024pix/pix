import Route from '@ember/routing/route';

export default Route.extend({
  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    await session.certifications;
    return session;
  },
  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('authenticated.certifications.sessions').set('sessionId', model.get('id'));
  }
});
