import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default class CertificationCandidatesController extends Controller {

  @alias('model.session') currentSession;
  @alias('model.isCertificationCenterSco') isCertificationCenterSco;
  @alias('model.isCertifPrescriptionScoEnabled') isCertifPrescriptionScoEnabled;
}
