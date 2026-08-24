import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationCentersGetRoute extends Route {
  @service store;

  async model(params) {
    const certificationCenter = await this.store.findRecord('certification-center', params.certification_center_id);
    const habilitations = await this.store.findAll('complementary-certification');

    return {
      certificationCenter,
      habilitations,
    };
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
