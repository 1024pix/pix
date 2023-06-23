import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationCandidatesRoute extends Route {
  @service currentUser;
  @service store;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model() {
    const details = await this.modelFor('authenticated.sessions.details');
    const countries = await this.store.findAll('country');

    details.set('countries', countries);
    return details;
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.session.certificationCenterId);
  }
}
