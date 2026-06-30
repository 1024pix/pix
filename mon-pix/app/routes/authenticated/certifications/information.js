import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InformationRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    let certificationCandidate;
    try {
      certificationCandidate = await this.store.findRecord(
        'certification-candidate',
        params.certification_candidate_id,
      );
    } catch {
      return this.router.replaceWith('authenticated.certifications.join');
    }

    const certificationInfo = await this.store.findRecord('certification-info', certificationCandidate.subscription);
    return {
      certificationCandidate,
      certificationInfo,
    };
  }
}
