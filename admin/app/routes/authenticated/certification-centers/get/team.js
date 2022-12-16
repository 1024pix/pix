import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AuthenticatedCertificationCentersGetTeamRoute extends Route {
  @service store;

  async model() {
    const { certificationCenter } = this.modelFor('authenticated.certification-centers.get');
    const certificationCenterId = certificationCenter.id;
    const certificationCenterMemberships = await this.store.query('certification-center-membership', {
      filter: {
        certificationCenterId,
      },
    });

    return { certificationCenterMemberships, certificationCenterId };
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
