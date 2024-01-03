import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
/* eslint-enable ember/no-computed-properties-in-native-classes*/

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
      await this.fileSaver.save({ url: this.model.session.urlToDownloadSupervisorKitPdf, token });
    } catch (err) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  get pageTitle() {
    return `${this.intl.t('pages.sessions.detail.page-title')} | Session ${this.model.session.id} | Pix Certif`;
  }

  @computed('certificationCandidates.length')
  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})` : '';
  }

  @computed('certificationCandidates.length')
  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  @computed('hasOneOrMoreCandidates')
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
