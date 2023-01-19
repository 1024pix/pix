import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
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
    return sumBy(this.session.completedCertificationReports.toArray(), (reports) =>
      Number(!reports.hasSeenEndTestScreen)
    );
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
      this.showSuccessNotification('Les informations de la session ont été transmises avec succès.');
    } catch (err) {
      if (err.errors?.[0]?.status === '409') {
        this.showConfirmModal = false;
        return this.showErrorNotification(err.errors[0].detail);
      }
      if (_isSessionNotStartedError(err)) {
        this.showErrorNotification(
          "Cette session n'a pas débuté, vous ne pouvez pas la finaliser. Vous pouvez néanmoins la supprimer."
        );
      } else {
        err.errors && err.errors[0] && err.errors[0].status === '400'
          ? this.showErrorNotification('Cette session a déjà été finalisée.')
          : this.showErrorNotification('Erreur lors de la finalisation de session.');
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
  toggleAllCertificationReportsHasSeenEndTestScreen(someWereChecked) {
    const newState = !someWereChecked;

    this.session.certificationReports
      .filter((certificationReport) => certificationReport.isCompleted)
      .forEach((certificationReport) => {
        certificationReport.hasSeenEndTestScreen = newState;
      });
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
    const invalidCertificationReports = this.session.certificationReports.filter(
      (certificationReport) => certificationReport.isInvalid
    );

    if (invalidCertificationReports.length) {
      const select = document.getElementById(
        `finalization-report-abort-reason__select${invalidCertificationReports.firstObject.id}`
      );

      this.showErrorNotification(
        "Une ou plusieurs certification(s) non terminée(s) n'ont pas de motif d'abandon. Veuillez les renseigner.",
        { autoClear: true }
      );
      select.scrollIntoView();
    }

    return invalidCertificationReports.length === 0;
  }
}

function _isSessionNotStartedError(err) {
  return (
    err.errors?.[0]?.detail ===
    "Cette session n'a pas débuté, vous ne pouvez pas la finaliser. Vous pouvez néanmoins la supprimer."
  );
}
