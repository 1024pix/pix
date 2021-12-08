import RSVP from 'rsvp';

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
export default class CertificationCentersGetRoute extends Route {
  @service store;

  async model(params) {
    const certificationCenter = await this.store.findRecord('certification-center', params.certification_center_id);
    const certificationCenterMemberships = await this.store.query('certification-center-membership', {
      filter: {
        certificationCenterId: certificationCenter.id,
      },
    });
    const habilitations = await this.store.findAll('habilitation');

    return RSVP.hash({
      certificationCenterMemberships,
      certificationCenter,
      habilitations,
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
