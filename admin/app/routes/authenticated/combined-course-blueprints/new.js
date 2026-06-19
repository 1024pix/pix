import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service store;

  async model() {
    const attestations = await this.store.findAll('attestation');
    const frameworks = await this.store.findAll('framework');

    return { attestations, frameworks };
  }
}
