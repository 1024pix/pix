import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';

export default class SessionsFinalizeController extends Controller {
  @service currentUser;
  @service pixToast;
  @service router;
  @service intl;
  @service store;

  @alias('model') session;

  examinerGlobalCommentMaxLength = 500;
  issueReportDescriptionMaxLength = 500;
  @tracked showConfirmModal = false;

  get pageTitle() {
    return `Finalisation | Session ${this.session.id} | Pix Certif`;
  }

  @action
  async abort(certificationReport, abortReason) {
    certificationReport.abortReason = abortReason;
  }

  @action
  async finalizeSession() {
    try {
      const adapter = this.store.adapterFor('certification-report');
      for (const certificationReport of this.session.uncompletedCertificationReports) {
        await adapter.abort({
          certificationCourseId: certificationReport.certificationCourseId,
          reason: certificationReport.abortReason,
        });
      }
      await this.session.save({ adapterOptions: { finalization: true } });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.session-finalization.notification.success'),
      });
    } catch (responseError) {
      const error = responseError?.errors?.[0];
      if (error?.code) {
        this.showConfirmModal = false;
        this.pixToast.sendErrorNotification({
          message: this.intl.t(`common.api-error-messages.${error.code}`),
        });
      } else {
        this.pixToast.sendErrorNotification({
          message: this.intl.t(`common.api-error-messages.SESSION_CANNOT_BE_FINALIZED`),
        });
      }
    }
    this.showConfirmModal = false;
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
  }

  @action
  deleteCertificationIssueReport(certificationIssueReport) {
    return certificationIssueReport.destroyRecord();
  }

  @action
  updateExaminerGlobalComment(event) {
    const inputText = event.target.value;
    if (inputText.length <= this.examinerGlobalCommentMaxLength) {
      this.session.examinerGlobalComment = this._convertStringToNullIfEmpty(inputText);
    }
  }

  @action
  openModal() {
    if (this.isValid()) {
      this.showConfirmModal = true;
    }
  }

  @action
  closeModal() {
    this.showConfirmModal = false;
  }

  @action
  toggleIncidentDuringCertificationSession(hasIncident) {
    this.session.hasIncident = hasIncident;
  }

  @action
  toggleSessionJoiningIssue(hasJoiningIssue) {
    this.session.hasJoiningIssue = hasJoiningIssue;
  }

  _convertStringToNullIfEmpty(str) {
    return isEmpty(trim(str)) ? null : str;
  }

  isValid() {
    const invalidCertificationReports = this.session
      .hasMany('certificationReports')
      .value()
      .filter((certificationReport) => certificationReport.isInvalid);

    if (invalidCertificationReports.length) {
      const select = document.getElementById(
        `finalization-report-abort-reason__select${invalidCertificationReports[0].id}`,
      );

      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.session-finalization.errors.no-abort-reason'),
      });
      select.scrollIntoView();
    }

    return invalidCertificationReports.length === 0;
  }
}
