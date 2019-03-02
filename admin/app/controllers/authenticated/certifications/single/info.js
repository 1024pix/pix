import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { schedule } from '@ember/runloop';
import { computed } from '@ember/object';

export default Controller.extend({

  // Properties
  certification:alias('model'),
  edition:false,
  notifications: service('notification-messages'),
  displayConfirm: false,
  confirmMessage:'',
  confirmAction:'onSave',
  statuses:null,

  // private properties
  _competencesCopy:null,
  _markStore: service('mark-store'),

  init() {
    this._super(...arguments);
    this.set('statuses', ['started', 'error', 'validated', 'rejected']);
  },

  isValid: computed('certification.status', function() {
    return this.get('certification.status') !== 'missing-assessment'
  }),

  // Actions
  actions: {
    onEdit() {
      this.set('edition', true);
    },
    onCancel() {
      this.set('edition', false);
      this.certification.rollbackAttributes();
      let competencesCopy = this._competencesCopy;
      if (competencesCopy) {
        this.set('certification.competencesWithMark', competencesCopy);
        this.set('_competencesCopy', null);
      }
    },
    onSaveConfirm() {
      this.set('confirmMessage', 'Souhaitez-vous mettre à jour cette certification ?');
      this.set('confirmAction', 'onSave');
      this.set('displayConfirm', true);
    },
    onCancelConfirm() {
      this.set('displayConfirm', false);
    },
    onSave() {
      this.set('displayConfirm', false);
      let certification = this.certification;
      let changedAttributes = certification.changedAttributes();
      let marksUpdateRequired = (changedAttributes.status || changedAttributes.pixScore || changedAttributes.competencesWithMark || changedAttributes.commentForCandidate || changedAttributes.commentForOrganization ||changedAttributes.commentForJury)?true:false;
      return certification.save({adapterOptions:{updateMarks:false}})
      .then(() => {
        if (marksUpdateRequired) {
          return certification.save({adapterOptions:{updateMarks:true}});
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
      let existingCompetences = this.get('certification.competencesWithMark');
      let newCompetences = existingCompetences.map((value) => {
        return value;
      });
      let competence = newCompetences.filter((value) => {
        return (value['competence-code'] === code);
      })[0];
      if (competence) {
        if (value.trim().length === 0) {
          if (competence.level) {
            competence.score = null;
          } else {
            let index = newCompetences.indexOf(competence);
            newCompetences.splice(index, 1);
          }
        } else {
          competence.score = parseInt(value);
        }
      } else if (value.trim().length > 0) {
        newCompetences.addObject({'competence-code':code, 'score':parseInt(value), 'area-code':code.substr(0,1)});
      }
      this.set('certification.competencesWithMark', newCompetences);
    },
    onUpdateLevel(code, value) {
      this._saveCompetences();
      let existingCompetences = this.get('certification.competencesWithMark');
      let newCompetences = existingCompetences.map((value) => {
        return value;
      });
      let competence = newCompetences.filter((value) => {
        return (value['competence-code'] === code);
      })[0];
      if (competence) {
        if (value.trim().length === 0) {
          if (competence.score) {
            competence.level = null;
          } else {
            let index = newCompetences.indexOf(competence);
            newCompetences.splice(index, 1);
          }
        } else {
          competence.level = parseInt(value);
        }
      } else if (value.trim().length > 0) {
        newCompetences.addObject({'competence-code':code, 'level':parseInt(value), 'area-code':code.substr(0,1)});
      }
      this.set('certification.competencesWithMark', newCompetences);
    },
    onTogglePublishConfirm() {
      let state = this.get('certification.isPublished');
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
      let certification = this.certification;
      let currentPublishState = certification.get('isPublished');
      let operation;
      if (currentPublishState) {
        certification.set('isPublished', false);
        operation = "dépubliée";
      } else {
        certification.set('isPublished', true);
        operation = "publiée";
      }
      return certification.save({adapterOptions:{updateMarks:false}})
      .then(() => {
        this.notifications.success('Certification '+operation);
      })
      .catch((e) => {
        this.notifications.error(e);
      });
    },
    onCheckMarks() {
      let markStore = this._markStore;
      if (markStore.hasState()) {
        let state = markStore.getState();
        let certification = this.certification;
        certification.set('pixScore', state.score);
        let newCompetences = Object.keys(state.marks).reduce((competences, code) => {
          let mark = state.marks[code];
          competences.addObject({'competence-code':code, 'level':mark.level, 'score': mark.score, 'area-code':code.substr(0,1)});
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
    let copy = this._competencesCopy;
    if (!copy) {
      let current = this.get('certification.competencesWithMark');
      this.set('_competencesCopy', current.copy(true));
    }
  }
});
