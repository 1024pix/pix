import _ from 'lodash';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import config from '../../../config/environment';
import { sumBy } from 'lodash';

export default class SessionsFinalizeController extends Controller {

  @service notifications;

  @alias('model') session;
  examinerGlobalCommentMaxLength = 500;
  examinerCommentMaxLength = 500;
  @tracked isLoading = false;
  @tracked showConfirmModal = false;

  @computed('session.certificationReports.@each.hasSeenEndTestScreen')
  get uncheckedHasSeenEndTestScreenCount() {
    return sumBy(
      this.session.certificationReports.toArray(),
      (reports) => Number(!reports.hasSeenEndTestScreen)
    );
  }

  get hasUncheckedHasSeenEndTestScreen() {
    return this.uncheckedHasSeenEndTestScreenCount > 0;
  }

  showErrorNotification(message) {
    const { autoClear, clearDuration } = config.notifications;
    this.notifications.error(message, { autoClear, clearDuration });
  }

  showSuccessNotification(message) {
    const { autoClear, clearDuration } = config.notifications;
    this.notifications.success(message, { autoClear, clearDuration });
  }

  @action
  async finalizeSession() {
    this.isLoading = true;
    try {
      await this.session.save({ adapterOptions: { finalization: true } });
      this.showSuccessNotification('Les informations de la session ont été transmises avec succès.');
    } catch (err) {
      (err.errors && err.errors[0] && err.errors[0].status === '400')
        ? this.showErrorNotification('Cette session a déjà été finalisée.')
        : this.showErrorNotification('Erreur lors de la finalisation de session.');
    }
    this.isLoading = false;
    this.showConfirmModal = false;
    this.transitionToRoute('authenticated.sessions.details', this.session.id);
  }

  @action
  updateExaminerGlobalComment(event) {
    const inputText = event.target.value;
    if (inputText.length <= this.examinerGlobalCommentMaxLength) {
      this.session.examinerGlobalComment = this._convertStringToNullIfEmpty(inputText);
    }
  }

  @action
  updateCertificationReportExaminerComment(certificationReport, event) {
    const inputText = event.target.value;
    if (inputText.length <= this.examinerCommentMaxLength) {
      certificationReport.examinerComment = this._convertStringToNullIfEmpty(inputText);
    }
  }

  @action
  toggleCertificationReportHasSeenEndTestScreen(certificationReport) {
    certificationReport.hasSeenEndTestScreen = !certificationReport.hasSeenEndTestScreen;
  }

  @action
  toggleAllCertificationReportsHasSeenEndTestScreen(someWereChecked) {
    const newState = !someWereChecked;

    this.session.certificationReports.forEach((certificationReport) => {
      certificationReport.hasSeenEndTestScreen = newState;
    });
  }

  @action
  openModal() {
    this.showConfirmModal = true;
  }

  @action
  closeModal() {
    this.showConfirmModal = false;
  }

  _convertStringToNullIfEmpty(str) {
    return _.isEmpty(_.trim(str)) ? null : str;
  }
}
