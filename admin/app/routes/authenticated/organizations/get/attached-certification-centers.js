import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachedCertificationCenter extends Route {
  @service store;

  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    return this.store.query('attached-certification-center', { organizationId: organization.id });
  }
}
