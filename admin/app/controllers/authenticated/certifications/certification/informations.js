import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import { cloneDeep } from 'lodash';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class CertificationInformationsController extends Controller {

  // Domain constants
  MAX_REACHABLE_LEVEL = 5;
  MAX_REACHABLE_PIX_BY_COMPETENCE = 40;

  // Properties
  @alias('model') certification;
  @tracked edition = false;
  @service notifications;
  @tracked displayConfirm = false;
  @tracked confirmMessage = '';
  @tracked confirmErrorMessage = '';
  @tracked confirmAction = 'onSave';

  // private properties
  _competencesCopy = null;
  @service('mark-store') _markStore;

  @computed('certification.status')
  get isValid() {
    return this.certification.status !== 'missing-assessment';
  }

  @action
  onEdit() {
    this.edition = true;
    this._competencesCopy = this._copyCompetences();
  }

  @action
  onCancel() {
    this.edition = false;
    this.certification.rollbackAttributes();
    if (this._competencesCopy) {
      this.certification.competencesWithMark = this._competencesCopy;
      this._competencesCopy = null;
    }
  }

  @action
  onSaveConfirm() {
    const confirmMessage = 'Souhaitez-vous mettre à jour cette certification ?';
    const errors = this._getCertificationErrorsAfterJuryUpdateIfAny();
    const confirmErrorMessage = this._formatErrorsToHtmlString(errors);

    this.confirmMessage = confirmMessage;
    this.confirmErrorMessage = confirmErrorMessage;
    this.confirmAction = 'onSave';
    this.displayConfirm = true;
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }

  @action
  async onSave() {
    const markUpdatedRequired = this.certification.hasDirtyAttributes;
    this.displayConfirm = false;
    try {
      await this.saveWithoutUpdatingCompetenceMarks();

      if (markUpdatedRequired) {
        await this.saveWithUpdatingCompetenceMarks();
      }

      this.notifications.success('Modifications enregistrées');
      this.edition = false;
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

  saveWithUpdatingCompetenceMarks() {
    return this.certification.save({ adapterOptions: { updateMarks: true } });
  }

  saveWithoutUpdatingCompetenceMarks() {
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
  onTogglePublishConfirm() {
    const state = this.certification.isPublished;
    if (state) {
      this.confirmMessage = 'Souhaitez-vous dépublier cette certification ?';
    } else {
      this.confirmMessage = 'Souhaitez-vous publier cette certification ?';
    }
    this.confirmAction = 'onTogglePublish';
    this.displayConfirm = true;
  }

  @action
  onCheckMarks() {
    if (this._markStore.hasState()) {
      const state = this._markStore.getState();
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
      schedule('afterRender', this, () => {
        this.edition = true;
      });
    }
  }

  @action
  onUpdateCertificationBirthdate(selectedDates, lastSelectedDateFormatted) {
    this.certification.birthdate = lastSelectedDateFormatted;
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

  _updatePropForCompetence(competenceCode, value, propName, linkedPropName) {
    const competences = this._copyCompetences();
    const competence = _.find(competences, { competence_code: competenceCode });
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
        area_code: competenceCode.substr(0, 1)
      });
    }
    this.certification.competencesWithMark = competences;
  }
}
