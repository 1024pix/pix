import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AuthenticatedCertificationsCertificationProfileRoute extends Route {
  @service store;

  model() {
    const { certification_id } = this.paramsFor('authenticated.certifications.certification');
    return this.store.findRecord('certified-profile', certification_id);
  }
}
