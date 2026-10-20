import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AttestationVisibilityService extends Service {
  @service store;

  @tracked hasAttestations = false;

  #loadedUserId = null;

  load(userId) {
    if (this.#loadedUserId === userId) return;
    this.#loadedUserId = userId;
    this.hasAttestations = false;

    const cacheKey = `pix-has-attestations-${userId}`;
    if (localStorage.getItem(cacheKey) === 'true') {
      this.hasAttestations = true;
      return;
    }

    return this.#fetch(userId, cacheKey);
  }

  async #fetch(userId, cacheKey) {
    try {
      const attestations = await this.store.findAll('attestation-detail');
      if (userId === this.#loadedUserId && attestations.length > 0) {
        localStorage.setItem(cacheKey, 'true');
        this.hasAttestations = true;
      }
    } catch {
      if (userId === this.#loadedUserId) this.hasAttestations = false;
    }
  }
}
