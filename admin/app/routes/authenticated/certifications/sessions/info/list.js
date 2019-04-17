import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const session = this.modelFor('authenticated.certifications.sessions.info');
    const certifications = session.hasMany('certifications');
    const ids = certifications.ids();
    return {
      session: session,
      certifications: session.get('certifications'),
      certificationIds: ids
    };
  }
});
