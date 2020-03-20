import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { A } from '@ember/array';
import { schedule } from '@ember/runloop';
import { cloneDeep } from 'lodash';

export default class InfoController extends Controller {

  // Domain constants
  MAX_REACHABLE_LEVEL = 5;
  MAX_REACHABLE_PIX_BY_COMPETENCE = 40;

  // Properties
  @alias('model') certification;
  edition = false;
  @service notifications;
  displayConfirm = false;
  confirmMessage = '';
  confirmErrorMessage = '';
  confirmAction = 'onSave';

  // private properties
  _competencesCopy = null;
  @service('mark-store') _markStore;

  @computed('certification.status')
  get isValid() {
    return this.get('certification.status') !== 'missing-assessment';
  }

  @action
  onEdit() {
    this.set('edition', true);
  }

  @action
  onCancel() {
    this.set('edition', false);
    this.certification.rollbackAttributes();
    const competencesCopy = this._competencesCopy;
    if (competencesCopy) {
      this.set('certification.competencesWithMark', competencesCopy);
      this.set('_competencesCopy', null);
    }
  }

  @action
  onSaveConfirm() {
    const confirmMessage = 'Souhaitez-vous mettre à jour cette certification ?';
    const errors = this._getCertificationErrorsAfterJuryUpdateIfAny();
    const confirmErrorMessage = this._formatErrorsToHtmlString(errors);

    this.set('confirmMessage', confirmMessage);
    this.set('confirmErrorMessage', confirmErrorMessage);
    this.set('confirmAction', 'onSave');
    this.set('displayConfirm', true);
  }

  @action
  onCancelConfirm() {
    this.set('displayConfirm', false);
  }

  @action
  onSave() {
    const markUpdatedRequired = this._isMarksUpdatedRequired();
    this.set('displayConfirm', false);
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
        this.set('edition', false);
        this.set('_competencesCopy', null);
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
    this._saveCompetences();
    const existingCompetences = this.get('certification.competencesWithMark');
    const newCompetences = existingCompetences.map((value) => {
      return value;
    });
    const competence = newCompetences.filter((value) => {
      return (value['competence-code'] === code);
    })[0];
    if (competence) {
      if (value.trim().length === 0) {
        if (competence.level) {
          competence.score = null;
        } else {
          const index = newCompetences.indexOf(competence);
          newCompetences.splice(index, 1);
        }
      } else {
        competence.score = parseInt(value);
      }
    } else if (value.trim().length > 0) {
      newCompetences.addObject({ 'competence-code': code, 'score': parseInt(value), 'area-code': code.substr(0, 1) });
    }
    this.set('certification.competencesWithMark', newCompetences);
  }

  @action
  onUpdateLevel(code, value) {
    this._saveCompetences();
    const existingCompetences = this.get('certification.competencesWithMark');
    const newCompetences = existingCompetences.map((value) => {
      return value;
    });
    const competence = newCompetences.filter((value) => {
      return (value['competence-code'] === code);
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
      newCompetences.addObject({ 'competence-code': code, 'level': parseInt(value), 'area-code': code.substr(0, 1) });
    }
    this.set('certification.competencesWithMark', newCompetences);
  }

  @action
  onTogglePublishConfirm() {
    const state = this.get('certification.isPublished');
    if (state) {
      this.set('confirmMessage', 'Souhaitez-vous dépublier cette certification ?');
    } else {
      this.set('confirmMessage', 'Souhaitez-vous publier cette certification ?');
    }
    this.set('confirmAction', 'onTogglePublish');
    this.set('displayConfirm', true);
  }

  @action
  onCheckMarks() {
    const markStore = this._markStore;
    if (markStore.hasState()) {
      const state = markStore.getState();
      const certification = this.certification;
      certification.set('pixScore', state.score);
      const newCompetences = Object.keys(state.marks).reduce((competences, code) => {
        const mark = state.marks[code];
        competences.addObject({
          'competence-code': code,
          'level': mark.level,
          'score': mark.score,
          'area-code': code.substr(0, 1)
        });
        return competences;
      }, A());
      certification.set('competencesWithMark', newCompetences);
      schedule('afterRender', this, () => {
        this.set('edition', true);
      });
    }
  }

  @action
  onUpdateCertificationBirthdate(selectedDates, lastSelectedDateFormatted) {
    this.set('certification.birthdate', lastSelectedDateFormatted);
  }

  // Private methods
  _saveCompetences() {
    const copy = this._competencesCopy;
    if (!copy) {
      const current = this.get('certification.competencesWithMark');
      this.set('_competencesCopy', cloneDeep(current));
    }
  }

  _isMarksUpdatedRequired() {
    const {
      status, pixScore, competencesWithMark, commentForCandidate, commentForOrganization, commentForJury
    } = this.certification.changedAttributes();
    return (
      status || pixScore || competencesWithMark || commentForCandidate || commentForOrganization || commentForJury
    );
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
          message: 'Le niveau de la compétence ' + competencesWithMark[index]['competence-code'] + ' dépasse ' + this.MAX_REACHABLE_LEVEL,
        });
      }
      if (score > this.MAX_REACHABLE_PIX_BY_COMPETENCE) {
        errors.push({
          type: 'score',
          message: 'Le nombre de pix de la compétence ' + competencesWithMark[index]['competence-code'] + ' dépasse ' + this.MAX_REACHABLE_PIX_BY_COMPETENCE,
        });
      }
    }

    return errors;
  }

  _formatErrorsToHtmlString(errors) {
    return errors && errors.map((err) => `${err.message}\n`).join('');
  }
}
