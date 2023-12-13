import { action } from '@ember/object';
import { service } from '@ember/service';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import isNumber from 'lodash/isNumber';

export default class CertificationDetailsController extends Controller {
  juryRate = false;
  juryScore = false;
  requestedId = '';

  @service('mark-store') _markStore;
  @service accessControl;
  @service router;

  @alias('details.percentageCorrectAnswers') rate;
  @alias('details.totalScore') score;
  @alias('model') details;

  get shouldDisplayJuryScore() {
    return isNumber(this.juryScore);
  }

  @action
  onStoreMarks() {
    this._markStore.storeState({
      score: this.juryScore === false ? this.score : this.juryScore,
      marks: this.details.competences.reduce((marks, competence) => {
        marks[competence.index] = {
          level: competence.juryLevel === false ? competence.obtainedLevel : competence.juryLevel,
          score: competence.juryScore === false ? competence.obtainedScore : competence.juryScore,
          competenceId: competence.id,
        };
        return marks;
      }, {}),
    });
    this.router.transitionTo('authenticated.certifications.certification.informations', this.details.id);
  }
}
