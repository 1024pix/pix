import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CertificationInformationsController extends Controller {

  // Domain constants
  MAX_REACHABLE_LEVEL = 5;
  MAX_REACHABLE_PIX_BY_COMPETENCE = 40;

  // Dependency injection
  @service notifications;
  @service markStore;

  // Properties
  @alias('model') certification;
  @tracked displayConfirm = false;
  @tracked confirmErrorMessage = null;

  // private properties
  _competencesCopy = null;

  get isValid() {
    return this.certification.status !== 'missing-assessment';
  }

  @action
  cancelCertificationSaving() {
    this.certification.rollbackAttributes();
    if (this._competencesCopy) {
      this.certification.competencesWithMark = this._competencesCopy;
      this._competencesCopy = null;
    }
    this.displayConfirm = false;
  }

  @action
  showConfirm() {
    this.displayConfirm = true;
    const errors = this._getCertificationErrorsAfterJuryUpdateIfAny();
    this.confirmErrorMessage = this._formatErrorsToHtmlString(errors);
  }

  @action
  async saveCertification() {
    const markUpdatedRequired = this.certification.hasDirtyAttributes;
    try {
      await this.certification.saveWithoutUpdatingCompetenceMarks();

      if (markUpdatedRequired) {
        await this.certification.saveCompetenceMarks();
      }

      this.notifications.success('Modifications enregistrées');
      this._competencesCopy = null;

    } catch (e) {
      if (e.errors && e.errors.length > 0) {
        e.errors.forEach((error) => {
          this.notifications.error(error.detail);
        });
      } else {
        this.notifications.error(e);
      }
    } finally {
      this.displayConfirm = false;
    }
  }

  @action
  onCheckMarks() {
    if (this.markStore.hasState()) {
      const state = this.markStore.getState();
      this.certification.pixScore = state.score ;
      const newCompetences = Object.entries(state.marks)
        .map(([code, mark]) => {
          return {
            'competence-id': mark.competenceId,
            competence_code: code,
            area_code: code.substr(0, 1),
            level: mark.level,
            score: mark.score,
          };
        });
      this.certification.competencesWithMark = A(newCompetences);
    }
  }

  // Private methods

  _getCertificationErrorsAfterJuryUpdateIfAny() {
    return this._getCertificationErrorsAfterJuryUpdate(this.certification.competencesWithMark);
  }

  _getCertificationErrorsAfterJuryUpdate(competencesWithMark) {
    const errors = [];
    for (const [index, { level, score }] of competencesWithMark.entries()) {
      if (level > this.MAX_REACHABLE_LEVEL) {
        errors.push({
          type: 'level',
          message: 'Le niveau de la compétence ' + competencesWithMark[index].competence_code + ' dépasse ' + this.MAX_REACHABLE_LEVEL,
        });
      }
      if (score > this.MAX_REACHABLE_PIX_BY_COMPETENCE) {
        errors.push({
          type: 'score',
          message: 'Le nombre de pix de la compétence ' + competencesWithMark[index].competence_code + ' dépasse ' + this.MAX_REACHABLE_PIX_BY_COMPETENCE,
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
}
