import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SessionSupervisingController extends Controller {
  @service session;
  @service pixToast;
  @service fileSaver;

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

  @action
  async fetchInvigilatorKit() {
    const token = this.session.data.authenticated.access_token;
    const url = `/api/sessions/${this.model.id}/supervisor-kit`;

    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.api-error-messages.internal-server-error') });
    }
  }
}
