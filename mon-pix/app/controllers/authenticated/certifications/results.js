import Controller from '@ember/controller';
import { assessmentStates } from 'mon-pix/models/assessment';

export default class CertificationResultsController extends Controller {
  get isEndedByInvigilator() {
    return this.model.assessment.get('state') === assessmentStates.ENDED_BY_INVIGILATOR;
  }

  get hasBeenEndedDueToFinalization() {
    return this.model.assessment.get('state') === assessmentStates.ENDED_DUE_TO_FINALIZATION;
  }

  get hasBeenEndedDueToDurationExceeded() {
    return this.model.assessment.get('state') === assessmentStates.ENDED_DUE_TO_DURATION_EXCEEDED;
  }
}
