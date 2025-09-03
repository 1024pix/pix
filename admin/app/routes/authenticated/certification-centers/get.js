import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class CertificationCentersGetRoute extends Route {
  @service store;

  async model(params) {
    let certificationCenter;
    try {
      certificationCenter = await this.store.findRecord('certification-center', params.certification_center_id);
    } catch {
      this.router.replaceWith('authenticated.certification-centers.list');
    }
    const habilitations = await this.store.findAll('complementary-certification');

    return RSVP.hash({
      certificationCenter,
      habilitations,
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
