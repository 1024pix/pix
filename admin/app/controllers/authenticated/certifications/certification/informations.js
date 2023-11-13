import { A } from '@ember/array';
import Controller from '@ember/controller';
/* eslint-disable ember/no-computed-properties-in-native-classes */
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
/* eslint-enable ember/no-computed-properties-in-native-classes */
import { service } from '@ember/service';
import { schedule } from '@ember/runloop';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import ENV from 'pix-admin/config/environment';

import { tracked } from '@glimmer/tracking';

const PIX_COUNT_BY_LEVEL = 8;

export default class CertificationInformationsController extends Controller {
  // Domain constants
  MAX_REACHABLE_LEVEL = ENV.APP.MAX_REACHABLE_LEVEL;
  MAX_REACHABLE_PIX_BY_COMPETENCE = this.MAX_REACHABLE_LEVEL * PIX_COUNT_BY_LEVEL;

  // Properties
  @alias('model.certification') certification;
  @alias('model.countries') countries;
  @tracked editingCandidateResults = false;
  @service notifications;
  @service intl;
  @service featureToggles;

  @tracked displayConfirm = false;
  @tracked confirmMessage = '';
  @tracked confirmErrorMessage = '';
  @tracked confirmAction = 'onCandidateResultsSave';
  @tracked isCandidateEditModalOpen = false;
  @tracked displayJuryLevelSelect = false;

  @tracked selectedJuryLevel = null;

  // private properties
  _competencesCopy = null;
  @service('mark-store') _markStore;

  @computed('certification.status')
  get isValid() {
    return this.certification.status !== 'missing-assessment';
  }

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

  get isModifyButtonDisabled() {
    return this.editingCandidateResults || this.certification.wasRegisteredBeforeCPF;
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
  onCandidateResultsEdit() {
    this.editingCandidateResults = true;
    this._competencesCopy = this._copyCompetences();
  }

  @action
  onCandidateResultsCancel() {
    this.editingCandidateResults = false;
    this.certification.rollbackAttributes();
    if (this._competencesCopy) {
      this.certification.competencesWithMark = this._competencesCopy;
      this._competencesCopy = null;
    }
  }

  @action
  onCandidateResultsSaveConfirm() {
    const confirmMessage = 'Souhaitez-vous mettre à jour cette certification ?';
    const errors = this._getCertificationErrorsAfterJuryUpdateIfAny();
    const confirmErrorMessage = this._formatErrorsToHtmlString(errors);

    this.confirmMessage = confirmMessage;
    this.confirmErrorMessage = confirmErrorMessage;
    this.confirmAction = 'onCandidateResultsSave';
    this.displayConfirm = true;
  }

  @action
  onCandidateResultsCancelConfirm() {
    this.displayConfirm = false;
  }

  @action
  async onCandidateResultsSave() {
    this.displayConfirm = false;
    try {
      await this.saveAssessementResult();

      this.notifications.success('Modifications enregistrées');
      this.editingCandidateResults = false;
      this._competencesCopy = null;
    } catch (e) {
      if (e.errors && e.errors.length > 0) {
        e.errors.forEach((error) => {
          this.notifications.error(error.detail);
        });
      } else {
        this.notifications.error(e);
      }
    }
  }

  saveAssessementResult() {
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
  onCheckMarks() {
    if (this._markStore.hasState()) {
      const state = this._markStore.getState();
      this.certification.pixScore = state.score;
      const newCompetences = Object.entries(state.marks).map(([code, mark]) => {
        return {
          competenceId: mark.competenceId,
          competence_code: code,
          area_code: code.substr(0, 1),
          level: mark.level,
          score: mark.score,
        };
      });
      this.certification.competencesWithMark = A(newCompetences);
      schedule('afterRender', this, () => {
        this.editingCandidateResults = true;
      });
    }
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

  _getCertificationErrorsAfterJuryUpdateIfAny() {
    return this._getCertificationErrorsAfterJuryUpdate(this.certification.competencesWithMark);
  }

  _getCertificationErrorsAfterJuryUpdate(competencesWithMark) {
    const errors = [];
    for (const [index, { level, score }] of competencesWithMark.entries()) {
      if (level > this.MAX_REACHABLE_LEVEL) {
        errors.push({
          type: 'level',
          message:
            'Le niveau de la compétence ' +
            competencesWithMark[index].competence_code +
            ' dépasse ' +
            this.MAX_REACHABLE_LEVEL,
        });
      }
      if (score > this.MAX_REACHABLE_PIX_BY_COMPETENCE) {
        errors.push({
          type: 'score',
          message:
            'Le nombre de pix de la compétence ' +
            competencesWithMark[index].competence_code +
            ' dépasse ' +
            this.MAX_REACHABLE_PIX_BY_COMPETENCE,
        });
      }
    }

    return errors;
  }

  _formatErrorsToHtmlString(errors) {
    return errors && errors.map((err) => `${err.message}\n`).join('');
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
