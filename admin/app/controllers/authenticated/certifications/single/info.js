import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { schedule } from '@ember/runloop';
import { computed } from '@ember/object';
import { cloneDeep } from 'lodash';

export default Controller.extend({

  // Domain constants
  MAX_REACHABLE_LEVEL: 5,
  MAX_REACHABLE_PIX_BY_COMPETENCE: 40,

  // Properties
  certification: alias('model'),
  edition: false,
  notifications: service('notification-messages'),
  displayConfirm: false,
  confirmMessage: '',
  confirmAction: 'onSave',

  // private properties
  _competencesCopy: null,
  _markStore: service('mark-store'),

  isValid: computed('certification.status', function() {
    return this.get('certification.status') !== 'missing-assessment';
  }),

  // Actions
  actions: {
    onEdit() {
      this.set('edition', true);
    },
    onCancel() {
      this.set('edition', false);
      this.certification.rollbackAttributes();
      const competencesCopy = this._competencesCopy;
      if (competencesCopy) {
        this.set('certification.competencesWithMark', competencesCopy);
        this.set('_competencesCopy', null);
      }
    },
    onSaveConfirm() {
      const changedAttributes = this.certification.changedAttributes();

      // Ensure the Jury update (if any) is valid before saving
      if (changedAttributes && changedAttributes.competencesWithMark) {
        const errMessage = this._certificationIsInvalidAfterJuryUpdate(changedAttributes.competencesWithMark);
        if (errMessage) {
          return this.notifications.error(errMessage);
        }
      }
      this.set('confirmMessage', 'Souhaitez-vous mettre à jour cette certification ?');
      this.set('confirmAction', 'onSave');
      this.set('displayConfirm', true);
    },
    onCancelConfirm() {
      this.set('displayConfirm', false);
    },
    onSave() {
      this.set('displayConfirm', false);
      return this.certification.save({ adapterOptions: { updateMarks: false } })
        .then(() => {
          if (this._isMarksUpdatedRequired()) {
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
    },
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
    },
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
    },
    onTogglePublishConfirm() {
      const state = this.get('certification.isPublished');
      if (state) {
        this.set('confirmMessage', 'Souhaitez-vous dépublier cette certification ?');
      } else {
        this.set('confirmMessage', 'Souhaitez-vous publier cette certification ?');
      }
      this.set('confirmAction', 'onTogglePublish');
      this.set('displayConfirm', true);
    },
    onTogglePublish() {
      this.set('displayConfirm', false);
      const certification = this.certification;
      const currentPublishState = certification.get('isPublished');
      let operation;
      if (currentPublishState) {
        certification.set('isPublished', false);
        operation = 'dépubliée';
      } else {
        certification.set('isPublished', true);
        operation = 'publiée';
      }
      return certification.save({ adapterOptions: { updateMarks: false } })
        .then(() => {
          this.notifications.success('Certification ' + operation);
        })
        .catch((e) => {
          this.notifications.error(e);
        });
    },
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
  },

  // Private methods
  _saveCompetences() {
    const copy = this._competencesCopy;
    if (!copy) {
      const current = this.get('certification.competencesWithMark');
      this.set('_competencesCopy', cloneDeep(current));
    }
  },

  _isMarksUpdatedRequired() {
    const {
      status, pixScore, competencesWithMark, commentForCandidate, commentForOrganization, commentForJury
    } = this.certification.changedAttributes();
    return (
      status || pixScore || competencesWithMark || commentForCandidate || commentForOrganization || commentForJury
    );
  },

  _certificationIsInvalidAfterJuryUpdate(competencesWithMarkGroupedByDomain) {
    for (const competenceWithMark of competencesWithMarkGroupedByDomain) {
      for (const [index, { level, score }] of competenceWithMark.entries()) {
        if (level > this.MAX_REACHABLE_LEVEL) {
          return 'Le niveau de la compétence ' + competenceWithMark[index]['competence-code'] + ' dépasse ' + this.MAX_REACHABLE_LEVEL;
        }
        if (score > this.MAX_REACHABLE_PIX_BY_COMPETENCE) {
          return 'Le nombre de pix de la compétence ' + competenceWithMark[index]['competence-code'] + ' dépasse ' + this.MAX_REACHABLE_PIX_BY_COMPETENCE;
        }
      }
    }
    return null;
  },

});
