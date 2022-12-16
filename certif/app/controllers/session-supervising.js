import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class SessionSupervisingController extends Controller {
  @action
  async toggleCandidate(candidate) {
    const authorizedToStart = !candidate.authorizedToStart;
    await candidate.updateAuthorizedToStart(authorizedToStart);
  }

  @action
  async authorizeTestResume(candidate) {
    await candidate.authorizeTestResume();
  }

  @action
  async endAssessmentBySupervisor(candidate) {
    await candidate.endAssessmentBySupervisor();
  }
}
