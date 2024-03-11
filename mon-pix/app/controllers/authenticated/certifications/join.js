import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class JoinCertificationController extends Controller {
  @service currentUser;
  @service router;

  @action
  changeStep(certificationCandidateId) {
    this.router.transitionTo('authenticated.certifications.start', certificationCandidateId);
  }
}
