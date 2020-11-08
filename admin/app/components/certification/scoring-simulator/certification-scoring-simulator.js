import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationScoringSimulatorComponent extends Component {

  @tracked juryRate = null;
  @tracked juryScore = null;

  @action
  changeAnswerResult() {
    const competences = this.args.details.competences;

    const { good, count, jury } = this._getCertificationResultsAfterJuryUpdate(competences);

    const newRate = Math.round(good * 100 / count);
    this.juryRate = jury ? newRate : null;

    const newScore = competences.reduce((calculatingScore, competence) => {
      calculatingScore += competence.juryScore ? competence.juryScore : competence.obtainedScore;
      return calculatingScore;
    }, 0);
    this.juryScore = jury ? newScore : null;
  }

  @action
  updateCertificationScoring() {
    if (this.juryScore) {
      this.args.certification.pixScore = this.juryScore;
    }
    this.args.onClose();
  }

  _getCertificationResultsAfterJuryUpdate(competences) {
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
}
