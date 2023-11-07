import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import sumBy from 'lodash/sumBy';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';

export default class SessionsFinalizeController extends Controller {
  @service currentUser;
  @service notifications;
  @service router;
  @service intl;

  @alias('model') session;

  examinerGlobalCommentMaxLength = 500;
  issueReportDescriptionMaxLength = 500;
  @tracked showConfirmModal = false;

  get pageTitle() {
    return `Finalisation | Session ${this.session.id} | Pix Certif`;
  }

  get shouldDisplayHasSeenEndTestScreenCheckbox() {
    return !this.session.hasSupervisorAccess;
  }

  get uncheckedHasSeenEndTestScreenCount() {
    return sumBy(this.session.completedCertificationReports, (reports) => Number(!reports.hasSeenEndTestScreen));
  }

  get hasUncheckedHasSeenEndTestScreen() {
    return this.uncheckedHasSeenEndTestScreenCount > 0;
  }

  showErrorNotification(message, options = {}) {
    this.notifications.error(message, options);
  }

  showSuccessNotification(message) {
    this.notifications.success(message);
  }

  @action
  async abort(certificationReport, option) {
    const abortReason = option;

    try {
      await certificationReport.abort(abortReason);

      certificationReport.abortReason = abortReason;
    } catch (error) {
      const select = document.getElementById(`finalization-report-abort-reason__select${certificationReport.id}`);

      if (certificationReport.abortReason) {
        select.value = certificationReport.abortReason;
      } else {
        select.options[0].selected = true;
      }
    }
  }

  @action
  async finalizeSession() {
    try {
      await this.session.save({ adapterOptions: { finalization: true } });
      this.showSuccessNotification(this.intl.t('pages.session-finalization.notification.success'));
    } catch (responseError) {
      // eslint-disable-next-line no-console
      console.error({ responseError });
      const error = responseError?.errors?.[0];
      if (error?.code) {
        this.showConfirmModal = false;
        this.notifications.error(this.intl.t(`common.api-error-messages.${error.code}`));
      } else {
        this.notifications.error(this.intl.t(`common.api-error-messages.SESSION_CANNOT_BE_FINALIZED`));
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
  toggleCertificationReportHasSeenEndTestScreen(certificationReport) {
    certificationReport.hasSeenEndTestScreen = !certificationReport.hasSeenEndTestScreen;
  }

  @action
  toggleAllCertificationReportsHasSeenEndTestScreen(allChecked, parentCheckbox) {
    const newState = !allChecked;

    this.session
      .hasMany('certificationReports')
      .value()
      .filter((certificationReport) => certificationReport.isCompleted)
      .forEach((certificationReport) => {
        certificationReport.hasSeenEndTestScreen = newState;
      });
    parentCheckbox.srcElement.checked = newState;
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

      this.showErrorNotification(this.intl.t('pages.session-finalization.errors.no-abort-reason'));
      select.scrollIntoView();
    }

    return invalidCertificationReports.length === 0;
  }
}
