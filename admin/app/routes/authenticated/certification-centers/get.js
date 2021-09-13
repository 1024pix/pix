import RSVP from 'rsvp';

import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CertificationCentersGetRoute extends Route {

  async model(params) {
    const certificationCenter = await this.store.findRecord('certification-center', params.certification_center_id);
    const certificationCenterMemberships = await this.store.query('certification-center-membership', {
      filter: {
        certificationCenterId: certificationCenter.id,
      },
    });
    const accreditations = await this.store.findAll('accreditation');

    return RSVP.hash({
      certificationCenterMemberships,
      certificationCenter,
      accreditations,
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
