import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class StartCertificationController extends Controller {
  @service currentUser;

  @tracked displayCongratulationsBanner = true;
  @tracked currentStep = 'join';
  @tracked sessionId = null;

  get showCongratulationsBanner() {
    return this.displayCongratulationsBanner && this.currentStep === 'join';
  }

  @action
  closeBanner() {
    this.displayCongratulationsBanner = false;
  }

  @action
  changeStep(sessionId) {
    this.sessionId = sessionId;
    this.currentStep = 'start';
  }
}
