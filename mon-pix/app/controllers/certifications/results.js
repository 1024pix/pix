import Controller from '@ember/controller';

export default class CertificationResultsController extends Controller {
  get isEndedBySupervisor() {
    return this.model.assessment.get('state') === 'endedBySupervisor';
  }
}
