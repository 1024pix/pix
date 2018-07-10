import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({

  // Properties
  certification:alias('model'),
  edition:false,
  notifications: service('notification-messages'),

  // private properties
  _competencesCopy:null,

  // Actions
  actions: {
    onEdit() {
      this.set('edition', true);
    },
    onCancel() {
      this.set('edition', false);
      this.get('certification').rollbackAttributes();
      let competencesCopy = this.get('_competencesCopy');
      if (competencesCopy) {
        this.set('certification.competencesWithMark', competencesCopy);
        this.set('_competencesCopy', null);
      }
    },
    onSave() {
      let certification = this.get('certification');
      let changedAttributes = certification.changedAttributes();
      let marksUpdateRequired = (changedAttributes.competencesWithMark)?true:false;
      certification.save({adapterOptions:{updateMarks:false}})
      .then(() => {
        if (marksUpdateRequired) {
          return certification.save({adapterOptions:{updateMarks:true}});
        } else {
          return Promise.resolve(true);
        }
      })
      .then(() => {
        this.get('notifications').success('Modifications enregistrées');
        this.set('edition', false);
        this.set('_competencesCopy', null);
      })
      .catch((e) => {
        if (e.errors && e.errors.length > 0) {
          e.errors.forEach((error) => {
            this.get('notifications').error(error.detail);
          });
        } else {
          this.get('notifications').error(e);
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
    }
  },

  // Private methods
  _saveCompetences() {
    let copy = this.get('_competencesCopy');
    if (!copy) {
      let current = this.get('certification.competencesWithMark');
      this.set('_competencesCopy', current.copy(true));
    }
  }
});
