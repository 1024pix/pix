import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class CertificationResultsController extends Controller {
  @service featureToggles;

  get isEndedBySupervisor() {
    return this.model.assessment.get('state') === 'endedBySupervisor';
  }
}
