import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationsV2Route extends Route {
  @service featureToggles;
  @service router;
  @service store;

  beforeModel() {
    if (!this.featureToggles.featureToggles?.isNewCertificationPageEnabled) {
      this.router.transitionTo('authenticated.certifications.join');
    }
  }

  async model() {
    return {
      certificationsSummaries: await this.store.findAll('certificate-summary'),
    };
  }
}
