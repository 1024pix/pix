import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class JoinCertificationController extends Controller {
  @service currentUser;
  @service router;

  @action
  changeStep(certificationCandidateId) {
    this.router.transitionTo('authenticated.certifications.start', certificationCandidateId);
  }
}
