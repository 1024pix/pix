import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class StartCertificationController extends Controller {

  @tracked showCongratulationsBanner = true;
  @service currentUser;

  @action
  closeBanner() {
    this.showCongratulationsBanner = false;
  }
}
