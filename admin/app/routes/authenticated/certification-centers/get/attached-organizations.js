import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedCertificationCentersGetAttachedOrganizationsRoute extends Route {
  @service store;

  async model() {
    const { certificationCenter } = this.modelFor('authenticated.certification-centers.get');

    return this.store.query('attached-organization', { certificationCenterId: certificationCenter.id });
  }
}
