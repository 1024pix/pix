import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';

export default class SessionsDetailsController extends Controller {
  @service currentUser;
  @service intl;
  @service url;
  @service session;
  @service notifications;
  @service fileSaver;

  @alias('model.certificationCandidates') certificationCandidates;

  @action
  async fetchInvigilatorKit() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.model.sessionManagement.urlToDownloadSupervisorKitPdf, token });
    } catch (err) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  @action
  async fetchAttendanceSheet() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.model.session.urlToDownloadAttendanceSheet, token });
    } catch (err) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  get pageTitle() {
    return `${this.intl.t('pages.sessions.detail.page-title')} | Session ${this.model.session.id} | Pix Certif`;
  }

  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})` : '';
  }

  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  get shouldDisplayDownloadButton() {
    return this.hasOneOrMoreCandidates;
  }

  get shouldDisplayPrescriptionScoStudentRegistrationFeature() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  get urlToDownloadSessionIssueReportSheet() {
    if (this.model.session.version === 3) {
      return this.url.urlToDownloadSessionV3IssueReportSheet;
    }
    return this.url.urlToDownloadSessionIssueReportSheet;
  }
}
