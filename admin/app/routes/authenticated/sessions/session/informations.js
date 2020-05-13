import Route from '@ember/routing/route';

export default class InformationsRoute extends Route {
  async model() {
    const session = this.modelFor('authenticated.sessions.session');
    await session.juryCertificationSummaries;
    return session;
  }
}
