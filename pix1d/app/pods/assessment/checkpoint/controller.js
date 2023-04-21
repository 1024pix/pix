import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class CheckpointController extends Controller {
  @service router;

  @action
  goToNextStep() {
    this.router.replaceWith('assessment.resume', this.model);
  }
}
