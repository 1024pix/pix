import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    let session = this.modelFor('authenticated.certifications.sessions.info');
    return session.get('certifications');
  }
});
