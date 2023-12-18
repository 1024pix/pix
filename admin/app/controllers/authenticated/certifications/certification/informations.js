import Controller from '@ember/controller';
/* eslint-disable ember/no-computed-properties-in-native-classes */
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
/* eslint-enable ember/no-computed-properties-in-native-classes */
import { service } from '@ember/service';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import ENV from 'pix-admin/config/environment';

import { tracked } from '@glimmer/tracking';

export default class CertificationInformationsController extends Controller {
  // Domain constants
  MAX_REACHABLE_LEVEL = ENV.APP.MAX_REACHABLE_LEVEL;

  // Properties
  @alias('model.certification') certification;
  @alias('model.countries') countries;
  @service notifications;
  @service intl;

  @tracked displayConfirm = false;
  @tracked modalTitle = null;
  @tracked confirmMessage = '';
  @tracked confirmErrorMessage = '';
  @tracked confirmAction = 'onCancelCertificationConfirmation';
  @tracked isCandidateEditModalOpen = false;
  @tracked displayJuryLevelSelect = false;

  @tracked selectedJuryLevel = null;

  @computed('certification.certificationIssueReports.@each.isImpactful')
  get impactfulCertificationIssueReports() {
    return this.certification.certificationIssueReports.filter((issueReport) => issueReport.isImpactful);
  }

  @computed('certification.certificationIssueReports.@each.isImpactful')
  get unimpactfulCertificationIssueReports() {
    return this.certification.certificationIssueReports.filter((issueReport) => !issueReport.isImpactful);
  }

  @computed('certification.certificationIssueReports.@each.isImpactful')
  get hasIssueReports() {
    return Boolean(this.certification.certificationIssueReports.length);
  }

  @computed('certification.certificationIssueReports.@each.isImpactful')
  get hasImpactfulIssueReports() {
    return Boolean(
      this.certification.certificationIssueReports.filter((issueReport) => issueReport.isImpactful).length,
    );
  }

  @computed('certification.certificationIssueReports.@each.isImpactful')
  get hasUnimpactfulIssueReports() {
    return Boolean(
      this.certification.certificationIssueReports.filter((issueReport) => !issueReport.isImpactful).length,
    );
  }

  @computed('certification.status')
  get isCertificationCancelled() {
    return this.certification.status === 'cancelled';
  }

  get juryLevelOptions() {
    const translatedDefaultJuryOptions = this.certification.complementaryCertificationCourseResultWithExternal
      .get('defaultJuryOptions')
      .map((value) => ({
        value,
        label: this.intl.t(`components.certifications.external-jury-select-options.${value}`),
      }));
    return [
      ...this.certification.complementaryCertificationCourseResultWithExternal.get('allowedExternalLevels'),
      ...translatedDefaultJuryOptions,
    ];
  }

  @action
  async resolveIssueReport(issueReport, resolutionLabel) {
    try {
      await issueReport.resolve(resolutionLabel);
      this.notifications.success('Le signalement a été résolu.');
    } catch (error) {
      this.notifications.error('Une erreur est survenue :\n' + error?.errors[0]?.detail);
    }
    await this.certification.reload();
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }

  saveAssessmentResult() {
    return this.certification.save({ adapterOptions: { updateMarks: true } });
  }

  saveCertificationCourse() {
    return this.certification.save({ adapterOptions: { updateMarks: false } });
  }

  @action
  onUpdateScore(code, value) {
    this._updatePropForCompetence(code, value, 'score', 'level');
  }

  @action
  onUpdateLevel(code, value) {
    this._updatePropForCompetence(code, value, 'level', 'score');
  }

  @action
  onCancelCertificationButtonClick() {
    const confirmMessage =
      'Êtes-vous sûr·e de vouloir annuler cette certification ? Cliquez sur confirmer pour poursuivre.';
    this.confirmAction = 'onCancelCertificationConfirmation';
    this.confirmMessage = confirmMessage;
    this.displayConfirm = true;
  }

  @action
  onUncancelCertificationButtonClick() {
    const confirmMessage =
      'Êtes-vous sûr·e de vouloir désannuler cette certification ? Cliquez sur confirmer pour poursuivre.';
    this.confirmAction = 'onUncancelCertificationConfirmation';
    this.confirmMessage = confirmMessage;
    this.displayConfirm = true;
  }

  @action
  onRejectCertificationButtonClick() {
    const confirmMessage =
      'Êtes-vous sûr·e de vouloir rejeter cette certification ? Cliquez sur confirmer pour poursuivre.';
    this.modalTitle = 'Confirmer le rejet de la certification';
    this.confirmAction = 'onRejectCertificationConfirmation';
    this.confirmMessage = confirmMessage;
    this.displayConfirm = true;
  }

  get shouldDisplayUnrejectCertificationButton() {
    return this.certification.status === 'rejected' && this.certification.isRejectedForFraud;
  }

  get shouldDisplayRejectCertificationButton() {
    return this.certification.status !== 'rejected';
  }

  @action
  onUnrejectCertificationButtonClick() {
    const confirmMessage =
      'Êtes-vous sûr·e de vouloir annuler le rejet de cette certification ? Cliquez sur confirmer pour poursuivre.';
    this.modalTitle = "Confirmer l'annulation du rejet de la certification";
    this.confirmAction = 'onUnrejectCertificationConfirmation';
    this.confirmMessage = confirmMessage;
    this.displayConfirm = true;
  }

  @action
  async onCancelCertificationConfirmation() {
    try {
      await this.certification.cancel();
      await this.certification.reload();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }

    this.displayConfirm = false;
  }

  @action
  async onUncancelCertificationConfirmation() {
    try {
      await this.certification.uncancel();
      await this.certification.reload();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }

    this.displayConfirm = false;
  }

  @action
  async onRejectCertificationConfirmation() {
    try {
      await this.certification.reject();
      await this.certification.reload();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }

    this.displayConfirm = false;
  }

  @action
  async onUnrejectCertificationConfirmation() {
    try {
      await this.certification.unreject();
      await this.certification.reload();
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }

    this.displayConfirm = false;
  }

  @action
  async onCandidateInformationSave() {
    try {
      await this.saveCertificationCourse();
      this.notifications.success('Les informations du candidat ont bien été enregistrées.');
      this.isCandidateEditModalOpen = false;
    } catch (e) {
      if (e.errors && e.errors.length > 0) {
        e.errors.forEach((error) => {
          this.notifications.error(error.detail);
        });
      } else {
        this.notifications.error(e);
      }
      throw e;
    }
  }

  @action
  async onCommentsSave() {
    try {
      await this.saveAssessmentResult();
      this.notifications.success('Les commentaires du jury ont bien été enregistrés.');
      return true;
    } catch (e) {
      this.notifications.error("Les commentaires du jury n'ont pas pu être enregistrés.");
      return false;
    }
  }

  @action
  openCandidateEditModal() {
    this.isCandidateEditModalOpen = true;
  }

  @action
  closeCandidateEditModal() {
    this.isCandidateEditModalOpen = false;
  }

  @action
  selectJuryLevel(value) {
    this.selectedJuryLevel = value;
  }

  @action
  async onEditJuryLevelSave() {
    if (!this.selectedJuryLevel) return;
    this.certification.editJuryLevel({
      juryLevel: this.selectedJuryLevel,
      complementaryCertificationCourseId: this.certification.complementaryCertificationCourseResultWithExternal.get(
        'complementaryCertificationCourseId',
      ),
    });

    this.displayJuryLevelSelect = false;

    await this.certification.reload();
  }

  get shouldDisplayJuryLevelEditButton() {
    return this.certification.complementaryCertificationCourseResultWithExternal.get('isExternalResultEditable');
  }

  @action editJury() {
    this.displayJuryLevelSelect = true;
  }

  @action onCancelJuryLevelEditButtonClick() {
    this.displayJuryLevelSelect = false;
  }

  // Private methods
  _copyCompetences() {
    return cloneDeep(this.certification.competencesWithMark);
  }

  _removeFromArray(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
  }

  _updatePropForCompetence(competenceCode, value, propName, linkedPropName) {
    const competences = this._copyCompetences();
    const competence = find(competences, { competence_code: competenceCode });
    if (competence) {
      if (value.trim().length === 0) {
        if (competence[linkedPropName]) {
          competence[propName] = null;
        } else {
          this._removeFromArray(competences, competence);
        }
      } else {
        competence[propName] = parseInt(value);
      }
    } else if (value.trim().length > 0) {
      competences.addObject({
        competence_code: competenceCode,
        [propName]: parseInt(value),
        area_code: competenceCode.substr(0, 1),
      });
    }
    this.certification.competencesWithMark = competences;
  }
}
