import Route from '@ember/routing/route';

export default class AuthenticatedCertificationsCertificationProfileRoute extends Route {

  model() {
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    return this.store.findRecord('certified-profile', certification_id);
  }
}
