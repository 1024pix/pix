import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CertificationCandidatesController extends Controller {
  @service currentUser;
  @service intl;
  @service pixToast;
  @service fileSaver;
  @service session;

  get currentSession() {
    return this.model.session;
  }

  get certificationCandidates() {
    return this.model.certificationCandidates;
  }

  get pageTitle() {
    return `${this.intl.t('pages.sessions.detail.candidates.page-title')} | Session ${
      this.currentSession.id
    } | Pix Certif`;
  }

  get importAllowed() {
    return this.model.certificationCandidates.every((certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }

  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.model.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  get disableEnrollCandidate() {
    return this.model.sessionManagement.hasExpired;
  }

  get shouldDisplayScoStudentRegistration() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  @action
  async fetchCandidatesImportTemplate() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.model.session.urlToDownloadCandidatesImportTemplate, token });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.api-error-messages.internal-server-error') });
    }
  }

  @action
  async reloadCertificationCandidateInController() {
    await this.model.reloadCertificationCandidate();
  }
}
