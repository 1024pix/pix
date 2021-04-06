import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @tracked certificationPointOfContact;

  get isFromSco() {
    return this.certificationPointOfContact.isSco;
  }

  get currentCertificationCenter() {
    return this.certificationPointOfContact.certificationCenters.findBy('id', String(this.certificationPointOfContact.currentCertificationCenterId));
  }

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.certificationPointOfContact = await this.store.findRecord('certification-point-of-contact', this.session.data.authenticated.user_id, { include: 'certificationCenters' });
      } catch (error) {
        this.certificationPointOfContact = null;
        return this.session.invalidate();
      }
    }
  }
}
