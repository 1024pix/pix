import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SessionSupervisingController extends Controller {
  @service session;
  @service pixToast;
  @service fileSaver;
  @service store;

  @action
  async toggleCandidate(candidate) {
    candidate.authorizedToStart = !candidate.authorizedToStart;
    try {
      await this.store
        .adapterFor('certification-candidate-for-supervising')
        .updateAuthorizedToStart({ candidateId: candidate.id, authorizedToStart: candidate.authorizedToStart });
    } catch {
      candidate.authorizedToStart = !candidate.authorizedToStart;
    }
  }

  @action
  async authorizeTestResume(candidate) {
    await this.store
      .adapterFor('certification-candidate-for-supervising')
      .authorizeTestResume({ candidateId: candidate.id });
  }

  @action
  async endAssessmentByInvigilator(candidate) {
    await this.store
      .adapterFor('certification-candidate-for-supervising')
      .endAssessmentByInvigilator({ candidateId: candidate.id });
  }

  @action
  async fetchInvigilatorKit() {
    const token = this.session.data.authenticated.access_token;
    const url = `/api/sessions/${this.model.id}/invigilator-kit`;

    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.api-error-messages.internal-server-error') });
    }
  }
}
