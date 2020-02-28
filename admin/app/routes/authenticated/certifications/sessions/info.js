import Route from '@ember/routing/route';

export default class InfoRoute extends Route {

  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    await session.certifications;
    return session;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    this.controllerFor('authenticated.certifications.sessions').set('sessionId', model.get('id'));
  }
}
