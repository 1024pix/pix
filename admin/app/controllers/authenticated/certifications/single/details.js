import Controller from '@ember/controller';
import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { schedule } from '@ember/runloop';
import { inject as service}  from '@ember/service';

export default Controller.extend({

  // Properties
  juryRate: false,
  juryScore: false,
  requestedId:'',

  // Private properties
  _markStore:service('mark-store'),

  // Aliases
  rate:alias('details.percentageCorrectAnswers'),
  score:alias('details.totalScore'),
  details:alias('model'),

  // Observers
  initJury:observer('details', function() {
    this.set('juryRate', false);
    this.set('juryScore', false);
  }),

  // Actions
  actions: {
    onUpdateRate() {
      const competences = this.get('details.competences');
      let jury = false;
      let answersData = competences.reduce((data, competence) => {
        if (competence.answers) {
          competence.answers.forEach((answer) => {
            if (answer.jury) {
              if (answer.jury === 'ok') {
                data.good++;
              }
              if (answer.jury !== 'skip') {
                data.count++;
              }
              jury = true;
            } else {
              data.count++;
              if (answer.result === 'ok') {
                data.good++;
              }
            }
          });
        }
        return data;
      }, {count:0, good:0});
      if (jury) {
        this.set('juryRate', Math.round(answersData.good*10000/answersData.count)/100);
      } else {
        this.set('juryRate', false);
      }
      // TODO: find a better way
      schedule('afterRender', this, () => {
        const score = this.get('score');
        const competences = this.get('details.competences');
        let newScore = competences.reduce((value,competence) => {
          value += (typeof competence.juryScore !== 'undefined' && competence.juryScore !== false)?competence.juryScore:competence.obtainedScore;
          return value;
        }, 0);
        if (newScore !== score) {
          this.set('juryScore', newScore);
        } else {
          this.set('juryScore', false);
        }
      });
    },
    onStoreMarks() {
      this.get('_markStore').storeState({
        score:(this.get('juryScore') === false)?this.get('score'):this.get('juryScore'),
        marks:this.get('details.competences').reduce((marks, competence) => {
          marks[competence.index] = {
            level:(competence.juryLevel === false)?competence.obtainedLevel:competence.juryLevel,
            score:(competence.juryScore === false)?competence.obtainedScore:competence.juryScore
          };
          return marks;
        }, {})
      });
      this.transitionToRoute('authenticated.certifications.single.info', this.get('details.id'));
    }
  }
});
