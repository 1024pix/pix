import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { schedule } from '@ember/runloop';

export default class DetailsController extends Controller {
  // Properties
  juryRate = false;

  juryScore = false;
  requestedId = '';

  // Private properties
  @service('mark-store')
  _markStore;

  // Aliases
  @alias('details.percentageCorrectAnswers')
  rate;

  @alias('details.totalScore')
  score;

  @alias('model')
  details;

  @action
  onUpdateRate() {
    const competences = this.get('details.competences');
    const { good, count, jury } = _getCertificationResultsAfterJuryUpdate(competences);

    if (jury) {
      this.set('juryRate', Math.round(good * 10000 / count) / 100);
    } else {
      this.set('juryRate', false);
    }
    // TODO: find a better way
    schedule('afterRender', this, () => {
      const score = this.score;
      const competences = this.get('details.competences');
      const newScore = competences.reduce((value, competence) => {
        value += (typeof competence.juryScore !== 'undefined' && competence.juryScore !== false) ? competence.juryScore : competence.obtainedScore;
        return value;
      }, 0);
      if (newScore !== score) {
        this.set('juryScore', newScore);
      } else {
        this.set('juryScore', false);
      }
    });
  }

  @action
  onStoreMarks() {
    this._markStore.storeState({
      score: (this.juryScore === false) ? this.score : this.juryScore,
      marks: this.get('details.competences').reduce((marks, competence) => {
        marks[competence.index] = {
          level: (competence.juryLevel === false) ? competence.obtainedLevel : competence.juryLevel,
          score: (competence.juryScore === false) ? competence.obtainedScore : competence.juryScore
        };
        return marks;
      }, {})
    });
    this.transitionToRoute('authenticated.certifications.single.info', this.get('details.id'));
  }
}

function _getCertificationResultsAfterJuryUpdate(competences) {
  return competences.reduce((data, competence) => {
    if (competence.answers) {
      competence.answers.forEach((answer) => {
        if (answer.jury) {
          if (answer.jury === 'ok') {
            data.good++;
          }
          if (answer.jury !== 'skip') {
            data.count++;
          }
          data.jury = true;
        } else {
          data.count++;
          if (answer.result === 'ok') {
            data.good++;
          }
        }
      });
    }
    return data;
  }, { count: 0, good: 0, jury: false });
}
