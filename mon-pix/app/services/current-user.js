import Service, { service } from '@ember/service';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  #user;
  #attestationsDetails = [];

  get user() {
    return this.#user;
  }

  get attestationsDetails() {
    return this.#attestationsDetails;
  }

  get hasAttestationsDetails() {
    return this.#attestationsDetails.length > 0;
  }

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.#user = await this.store.queryRecord('user', { me: true });
        await this.loadAttestationDetails();
      } catch {
        this.#user = null;
        return this.session.invalidate();
      }
    }
  }

  async loadAttestationDetails() {
    if (this.session.isAuthenticated) {
      try {
        this.#attestationsDetails = await this.store.findAll('attestation-detail');
      } catch {
        this.#attestationsDetails = [];
      }
    }
  }
}
