import Route from '@ember/routing/route';

export default Route.extend({
  async model() {
    const session = this.modelFor('authenticated.certifications.sessions.info');
    await session.certifications;
    return session;
  }
});
