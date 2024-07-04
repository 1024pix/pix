import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InformationRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    const certificationCandidate = await this.store.peekRecord(
      'certification-candidate',
      params.certification_candidate_id,
    );

    if (!certificationCandidate) {
      this.router.replaceWith('authenticated.certifications.join');
    }

    return certificationCandidate;
  }
}
