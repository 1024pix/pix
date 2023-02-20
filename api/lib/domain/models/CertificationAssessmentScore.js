import _ from 'lodash';
import { status } from './AssessmentResult';

class CertificationAssessmentScore {
  constructor({
    competenceMarks = [],
    percentageCorrectAnswers = 0,
    hasEnoughNonNeutralizedChallengesToBeTrusted,
  } = {}) {
    this.competenceMarks = competenceMarks;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this.hasEnoughNonNeutralizedChallengesToBeTrusted = hasEnoughNonNeutralizedChallengesToBeTrusted;
  }

  get nbPix() {
    if (_.isEmpty(this.competenceMarks)) {
      return 0;
    }
    return _.sumBy(this.competenceMarks, 'score');
  }

  get status() {
    if (this.nbPix === 0) {
      return status.REJECTED;
    }
    return status.VALIDATED;
  }

  getCompetenceMarks() {
    return this.competenceMarks;
  }

  getPercentageCorrectAnswers() {
    return this.percentageCorrectAnswers;
  }
}

export default CertificationAssessmentScore;
export { status as statuses };
