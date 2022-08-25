import Controller from '@ember/controller';
import { assessmentStates } from 'mon-pix/models/assessment';

export default class CertificationResultsController extends Controller {
  get isEndedBySupervisor() {
    return this.model.assessment.get('state') === assessmentStates.ENDED_BY_SUPERVISOR;
  }

  get hasBeenEndedDueToFinalization() {
    return this.model.assessment.get('state') === assessmentStates.ENDED_DUE_TO_FINALIZATION;
  }
}
