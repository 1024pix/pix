import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    let session = this.modelFor('authenticated.certifications.sessions.info');
    let certifications = session.hasMany('certifications');
    let ids = certifications.ids();
    return {
      session:session,
      certifications:session.get('certifications'),
      certificationIds:ids
    }
  }
});
