import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import RSVP from 'rsvp';

export default class CertificationCentersGetRoute extends Route.extend(AuthenticatedRouteMixin) {

  async model(params) {
    const certificationCenter = await this.store.findRecord('certification-center', params.certification_center_id);
    const certificationCenterMemberships = await this.store.query('certification-center-membership', {
      filter: {
        certificationCenterId: certificationCenter.id,
      },
    });

    return RSVP.hash({
      certificationCenterMemberships,
      certificationCenter,
    });
  }
}
