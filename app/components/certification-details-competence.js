import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  // Elements
  classNames: ['card', 'border-primary', 'certification-details-competence'],

  // Properties
  competence:null,
  rate:0,
  juryRate:false,

  // Computed properties
  certifiedWidth: computed('competence', function(){
    let obtainedLevel = this.get('competence').obtainedLevel;
    return htmlSafe('width:'+Math.round((obtainedLevel / 8)*100)+'%');
  }),
  positionedWidth: computed('competence', function() {
    let positionedLevel = this.get('competence').positionedLevel;
    return htmlSafe('width:'+Math.round((positionedLevel / 8)*100)+'%');
  }),
  answers: computed('competence', function() {
    const competence = this.get('competence');
    return competence.answers;
  }),
  competenceJury:computed('juryRate', function() {
    const juryRate = this.get('juryRate');
    const competence = this.get('competence');
    if (juryRate === false )  {
      competence.juryScore = false;
      return false;
    }
    const score = competence.obtainedScore;
    let newScore = this._computeScore(juryRate);
    if (newScore.score != score) {
      competence.juryScore = newScore.score;
      return ({
        score:newScore.score,
        level:newScore.level,
        width:htmlSafe('width:'+Math.round((newScore.level / 8)*100)+'%')
      });
    } else {
      competence.juryScore = false;
      return false;
    }
  }),

  // Private methods
  _computeScore: function(rate) {
    if (rate < 50) {
      return {score:0, level:-1};
    }
    let competence = this.get('competence');
    const score = competence.positionedScore;
    const level = competence.positionedLevel;
    const answers = competence.answers;
    let answersData = {good:0, partially:0, count:0};
    if (answers) {
      answersData = answers.reduce((data, answer) => {
        let value = answer.jury ? answer.jury:answer.result;
        if (value === 'ok') {
          data.good++;
        } else if (value === 'partially') {
          data.partially++;
        }
        if (value !== 'skip') {
          data.count++;
        }
        return data;
      }
      , answersData);
    }
    switch (answersData.count) {
      case 0:
        return {score:0, level:-1};
      case 1:
        if (answersData.good === 1) {
          return {score:score, level:level};
        }
        return {score:0, level:0};
      case 2:
        if (answersData.good === 2) {
          return {score:score, level:level};
        } else if (answersData.good === 1) {
          if (answersData.partially === 1) {
            if (rate >= 80) {
              return {score:score, level:level};
            } else {
              return {score:score-8, level:level-1};
            }
          }
        }
        return {score:0, level:-1};
      case 3:
        if (answersData.good === 3) {
          return {score:score, level:level};
        } else if (answersData.good === 2) {
          if (rate >= 80) {
            return {score:score, level:level};
          } else {
            return {score:score-8, level:level-1};
          }
        }
        return {score:0, level:-1};
    }
  }
});
