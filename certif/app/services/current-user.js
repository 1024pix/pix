import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @tracked certificationPointOfContact;

  get isFromSco() {
    return this.certificationPointOfContact.isSco;
  }

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.certificationPointOfContact = await this.store.findRecord('certification-point-of-contact', this.session.data.authenticated.user_id);
      } catch (error) {
        if (get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
}
