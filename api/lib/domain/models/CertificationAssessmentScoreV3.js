import { status as CertificationStatus } from './AssessmentResult.js';
import { config } from '../../../src/shared/config.js';
import { ABORT_REASONS } from './CertificationCourse.js';

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
    end: -1.399264,
  },
  {
    start: -1.399264,
    end: -0.519812,
  },
  {
    start: -0.519812,
    end: 0.670847,
  },
  {
    start: 0.670847,
    end: 1.549962,
  },
  {
    start: 1.549962,
    end: 2.27406,
  },
  {
    start: 2.27406,
    end: 3.09502,
  },
  {
    start: 3.09502,
    end: 3.930395,
  },
  {
    start: 3.930395,
    end: MAXIMUM_ESTIMATED_LEVEL,
  },
];

const MAX_PIX_SCORE = 1024;
const INTERVAL_HEIGHT = MAX_PIX_SCORE / scoreIntervals.length;

class CertificationAssessmentScoreV3 {
  constructor({ nbPix, percentageCorrectAnswers = 100, status = CertificationStatus.VALIDATED }) {
    this.nbPix = nbPix;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this._status = status;
  }

  static fromChallengesAndAnswers({ algorithm, challenges, allAnswers, abortReason }) {
    const { estimatedLevel } = algorithm.getEstimatedLevelAndErrorRate({
      challenges,
      allAnswers,
    });

    const { maximumAssessmentLength } = algorithm.getConfiguration();

    const rawScore = _computeScore(estimatedLevel);

    const nbPix = _shouldDowngradeScore({ maximumAssessmentLength, answers: allAnswers })
      ? _downgradeScore(rawScore)
      : rawScore;

    const status = _isCertificationRejected({ answers: allAnswers, abortReason })
      ? CertificationStatus.REJECTED
      : CertificationStatus.VALIDATED;

    return new CertificationAssessmentScoreV3({
      nbPix,
      status,
    });
  }

  get status() {
    return this._status;
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

const _downgradeScore = (score) => Math.round(score * 0.8);

const _shouldDowngradeScore = ({ maximumAssessmentLength, answers }) => {
  return (
    _hasCandidateAnsweredEnoughQuestions({ answers }) &&
    !_hasCandidateCompletedTheCertification({ answers, maximumAssessmentLength })
  );
};

const _isCertificationRejected = ({ answers, abortReason }) => {
  return !_hasCandidateAnsweredEnoughQuestions({ answers }) && abortReason === ABORT_REASONS.CANDIDATE;
};

const _hasCandidateCompletedTheCertification = ({ answers, maximumAssessmentLength }) => {
  return answers.length >= maximumAssessmentLength;
};

const _hasCandidateAnsweredEnoughQuestions = ({ answers }) => {
  return answers.length >= config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
};

export { CertificationAssessmentScoreV3 };
