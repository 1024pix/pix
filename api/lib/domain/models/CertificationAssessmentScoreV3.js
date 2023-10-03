import { status } from './AssessmentResult.js';
import { FlashAssessmentAlgorithm } from './FlashAssessmentAlgorithm.js';

const MINIMUM_ESTIMATED_LEVEL = -8;
const MAXIMUM_ESTIMATED_LEVEL = 8;
/*
Score should not be totally linear. It should be piecewise linear, so we define
here the different intervals. See documentation here :
https://1024pix.atlassian.net/wiki/spaces/DD/pages/3835133953/Vulgarisation+score+2023
 */
const scoreIntervals = [
  {
    start: MINIMUM_ESTIMATED_LEVEL,
    end: -6,
  },
  {
    start: -6,
    end: -4,
  },
  {
    start: -4,
    end: -2,
  },
  {
    start: -2,
    end: 0,
  },
  {
    start: 0,
    end: 2,
  },
  {
    start: 2,
    end: 4,
  },
  {
    start: 4,
    end: 6,
  },
  {
    start: 6,
    end: MAXIMUM_ESTIMATED_LEVEL,
  },
];

const MAX_PIX_SCORE = 1024;
const INTERVAL_HEIGHT = MAX_PIX_SCORE / scoreIntervals.length;

class CertificationAssessmentScoreV3 {
  constructor({ nbPix, percentageCorrectAnswers = 100 }) {
    this.nbPix = nbPix;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
  }

  static fromChallengesAndAnswers({ challenges, allAnswers }) {
    const algorithm = new FlashAssessmentAlgorithm();
    const { estimatedLevel } = algorithm.getEstimatedLevelAndErrorRate({
      challenges,
      allAnswers,
    });

    const nbPix = _computeScore(estimatedLevel);

    return new CertificationAssessmentScoreV3({
      nbPix,
    });
  }

  get status() {
    return status.VALIDATED;
  }

  get competenceMarks() {
    return [];
  }

  getPercentageCorrectAnswers() {
    return this.percentageCorrectAnswers;
  }
}

const _findIntervalIndex = (estimatedLevel) =>
  scoreIntervals.findIndex(({ start, end }) => estimatedLevel <= end && estimatedLevel >= start);

const _computeScore = (estimatedLevel) => {
  let normalizedEstimatedLevel = estimatedLevel;

  if (normalizedEstimatedLevel < MINIMUM_ESTIMATED_LEVEL) {
    normalizedEstimatedLevel = MINIMUM_ESTIMATED_LEVEL;
  }
  if (normalizedEstimatedLevel > MAXIMUM_ESTIMATED_LEVEL) {
    normalizedEstimatedLevel = MAXIMUM_ESTIMATED_LEVEL;
  }

  const intervalIndex = _findIntervalIndex(normalizedEstimatedLevel);

  const intervalMaxValue = scoreIntervals[intervalIndex].end;
  const intervalWidth = scoreIntervals[intervalIndex].end - scoreIntervals[intervalIndex].start;

  // Formula is defined here : https://1024pix.atlassian.net/wiki/spaces/DD/pages/3835133953/Vulgarisation+score+2023#Le-score
  const score = INTERVAL_HEIGHT * (intervalIndex + 1 + (normalizedEstimatedLevel - intervalMaxValue) / intervalWidth);

  return Math.round(score);
};

export { CertificationAssessmentScoreV3 };
