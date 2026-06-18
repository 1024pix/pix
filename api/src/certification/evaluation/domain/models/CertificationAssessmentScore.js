import { status } from '../../../../shared/domain/models/AssessmentResult.js';
import { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED } from '../../../shared/domain/constants.js';

export class CertificationAssessmentScore {
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
    return this.competenceMarks.reduce((pixCount, competenceMark) => pixCount + competenceMark.score, 0);
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
