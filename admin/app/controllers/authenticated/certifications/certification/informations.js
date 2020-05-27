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
  onSave() {
    const markUpdatedRequired = this._isMarksUpdatedRequired();
    this.displayConfirm = false;
    return this.certification.save({ adapterOptions: { updateMarks: false } })
      .then(() => {
        if (markUpdatedRequired) {
          return this.certification.save({ adapterOptions: { updateMarks: true } });
        } else {
          return Promise.resolve(true);
        }
      })
      .then(() => {
        this.notifications.success('Modifications enregistrées');
        this.edition = false;
        this._competencesCopy = null;
      })
      .catch((e) => {
        if (e.errors && e.errors.length > 0) {
          e.errors.forEach((error) => {
            this.notifications.error(error.detail);
          });
        } else {
          this.notifications.error(e);
        }
      });
  }

  @action
  onUpdateScore(code, value) {
    // TODO refacto this please
    this._saveCompetences();
    const existingCompetences = this.certification.competencesWithMark;
    const competence = _.find(existingCompetences, { 'competence_code': code });
    if (competence) {
      if (value.trim().length === 0) {
        if (competence.level) {
          competence.score = null;
        } else {
          const index = existingCompetences.indexOf(competence);
          existingCompetences.splice(index, 1);
        }
      } else {
        competence.score = parseInt(value);
      }
    } else if (value.trim().length > 0) {
      existingCompetences.addObject({ 'competence_code': code, 'score': parseInt(value), 'area_code': code.substr(0, 1) });
    }
    this.certification.competencesWithMark = existingCompetences;
  }

  @action
  onUpdateLevel(code, value) {
    // TODO refacto this please
    this._saveCompetences();
    const existingCompetences = this.certification.competencesWithMark;
    const newCompetences = existingCompetences.map((value) => {
      return value;
    });
    const competence = newCompetences.filter((value) => {
      return (value['competence_code'] === code);
    })[0];
    if (competence) {
      if (value.trim().length === 0) {
        if (competence.score) {
          competence.level = null;
        } else {
          const index = newCompetences.indexOf(competence);
          newCompetences.splice(index, 1);
        }
      } else {
        competence.level = parseInt(value);
      }
    } else if (value.trim().length > 0) {
      newCompetences.addObject({ 'competence_code': code, 'level': parseInt(value), 'area_code': code.substr(0, 1) });
    }
    this.certification.competencesWithMark = newCompetences;
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
    const markStore = this._markStore;
    if (markStore.hasState()) {
      const state = markStore.getState();
      const certification = this.certification;
      certification.pixScore = state.score;
      const newCompetences = Object.keys(state.marks).reduce((competences, code) => {
        const mark = state.marks[code];
        competences.addObject({
          'competence_code': code,
          'level': mark.level,
          'score': mark.score,
          'area_code': code.substr(0, 1),
          'competence-id': mark.competenceId,
        });
        return competences;
      }, A());
      certification.competencesWithMark = newCompetences;
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
  _saveCompetences() {
    if (!this._competencesCopy) {
      const current = this.certification.competencesWithMark;
      this._competencesCopy = cloneDeep(current);
    }
  }

  _isMarksUpdatedRequired() {
    const attributesChangedAndLinkedToMarks = _.pick(
      this.certification.changedAttributes(),
      ['status', 'pixScore', 'competencesWithMark', 'commentForCandidate', 'commentForOrganization', 'commentForJury']
    );
    return _.some(attributesChangedAndLinkedToMarks);
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
          message: 'Le niveau de la compétence ' + competencesWithMark[index]['competence_code'] + ' dépasse ' + this.MAX_REACHABLE_LEVEL,
        });
      }
      if (score > this.MAX_REACHABLE_PIX_BY_COMPETENCE) {
        errors.push({
          type: 'score',
          message: 'Le nombre de pix de la compétence ' + competencesWithMark[index]['competence_code'] + ' dépasse ' + this.MAX_REACHABLE_PIX_BY_COMPETENCE,
        });
      }
    }

    return errors;
  }

  _formatErrorsToHtmlString(errors) {
    return errors && errors.map((err) => `${err.message}\n`).join('');
  }
}
