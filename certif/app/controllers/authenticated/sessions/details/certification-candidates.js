import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class CertificationCandidatesController extends Controller {

  @alias('model.session') currentSession;
  @alias('model.isCertificationCenterSco') isCertificationCenterSco;
  @alias('model.isCertifPrescriptionScoEnabled') isCertifPrescriptionScoEnabled;

  @computed('model.session.certificationCandidates.length')
  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.model.session.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }
}
