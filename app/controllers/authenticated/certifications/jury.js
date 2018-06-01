import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  juryRate: false,
  juryScore: false,
  requestedId:'',
  rate:alias('details.percentageCorrectAnswers'),
  score:alias('details.totalScore'),
  loading:computed('details.isLoaded', function() {
    return this.get('details')&&!this.get('details.isLoaded');
  }),
  details:computed('certificationId', function() {
    let certificationId = this.get('certificationId');
    if (certificationId) {
      return this.get('store').findRecord('certificationDetails', certificationId);
    } else {
      return null;
    }
  }),
  initJury:observer('loading', function() {
    if (this.get('loading')) {
      this.set('juryRate', false);
      this.set('juryScore', false);
    }
  }),
  actions: {
    loadCertificationDetails() {
      this.set('certificationId', this.get('requestedId'));
    },
    updateDetails() {
      const competences = this.get('details.competences');
      const score = this.get('score');
      let jury = false;
      let answersData = competences.reduce((data, competence) => {
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
        return data;
      }, {count:0, good:0});
      let newScore = competences.reduce((value,competence) => {
        value += (competence.juryScore && competence.juryScore !== false)?competence.juryScore:competence.obtainedScore;
        return value;
      }, 0);
      if (newScore !== score) {
        this.set('juryScore', newScore);
      } else {
        this.set('juryScore', false);
      }
      if (!jury) {
        this.set('juryRate', false);
      } else {
        this.set('juryRate', Math.round(answersData.good*10000/answersData.count)/100);
      }
    }
  }
});
