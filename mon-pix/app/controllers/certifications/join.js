import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class JoinCertificationController extends Controller {
  @service currentUser;
  @service router;

  @tracked displayCongratulationsBanner = true;

  get showCongratulationsBanner() {
    return this.displayCongratulationsBanner;
  }

  @action
  closeBanner() {
    this.displayCongratulationsBanner = false;
  }

  @action
  changeStep(certificationCandidateId) {
    this.router.transitionTo('certifications.start', certificationCandidateId);
  }
}
