/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import sumBy from 'lodash/sumBy';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';

export default class SessionsFinalizeController extends Controller {

  @service featureToggles;

  @service notifications;

  @alias('model') session;

  examinerGlobalCommentMaxLength = 500;
  issueReportDescriptionMaxLength = 500;
  @tracked isLoading = false;
  @tracked showConfirmModal = false;

  get pageTitle() {
    return `Finalisation | Session ${this.session.id} | Pix Certif`;
  }

  get isManageUncompletedCertifEnabled() {
    return this.featureToggles.featureToggles.isManageUncompletedCertifEnabled;
  }

  @computed('session.certificationReports.@each.hasSeenEndTestScreen')
  get uncheckedHasSeenEndTestScreenCount() {
    return sumBy(
      this.session.certificationReports.toArray(),
      (reports) => Number(!reports.hasSeenEndTestScreen),
    );
  }

  get hasUncheckedHasSeenEndTestScreen() {
    return this.uncheckedHasSeenEndTestScreenCount > 0;
  }

  showErrorNotification(message) {
    this.notifications.error(message);
  }

  showSuccessNotification(message) {
    this.notifications.success(message);
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
    return isEmpty(trim(str)) ? null : str;
  }

  @action
  onChangeAbortReason(value) {
    throw new Error('Not implemented', value);
  }
}
