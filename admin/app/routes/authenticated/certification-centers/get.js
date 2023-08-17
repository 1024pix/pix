import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class CertificationCentersGetRoute extends Route {
  @service store;

  async model(params) {
    const certificationCenter = await this.store.findRecord('certification-center', params.certification_center_id);
    const habilitations = await this.store.findAll('complementary-certification');

    return RSVP.hash({
      certificationCenter,
      habilitations,
    });
  }
}
