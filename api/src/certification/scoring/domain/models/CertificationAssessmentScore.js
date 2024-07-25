import _ from 'lodash';

import { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED } from '../../../../shared/domain/constants.js';
import { status } from '../../../../shared/domain/models/AssessmentResult.js';

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

  hasInsufficientCorrectAnswers() {
    return this.percentageCorrectAnswers < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
  }
}

CertificationAssessmentScore.statuses = status;

export { CertificationAssessmentScore, status as statuses };
