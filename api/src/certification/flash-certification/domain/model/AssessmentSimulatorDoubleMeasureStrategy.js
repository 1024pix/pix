import { Answer } from '../../../../evaluation/domain/models/Answer.js';

const NUMBER_OF_MEASURES = 2;
export class AssessmentSimulatorDoubleMeasureStrategy {
  constructor({ algorithm, challenges, pickChallenge, pickAnswerStatus, initialCapacity, doubleMeasuresUntil }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswerStatus = pickAnswerStatus;
    this.pickChallenge = pickChallenge;
    this.initialCapacity = initialCapacity;
    this.doubleMeasuresUntil = doubleMeasuresUntil;
  }

  run({ challengesAnswers, stepIndex }) {
    const results = [];
    const newAnswers = [];

    for (let index = 0; index < NUMBER_OF_MEASURES; index++) {
      const possibleChallenges = this.algorithm.getPossibleNextChallenges({
        allAnswers: [...challengesAnswers, ...newAnswers],
        challenges: this.challenges,
        initialCapacity: this.initialCapacity,
        answersForComputingEstimatedLevel: challengesAnswers,
      });

      const availableChallenges = possibleChallenges.filter(({ id }) => {
        return newAnswers.every(({ challengeId }) => challengeId !== id);
      });
      const { hasAssessmentEnded, nextChallenge, answer } = this._getNextChallengeAndAnswer({
        possibleChallenges: availableChallenges,
        stepIndex: stepIndex + index,
      });

      if (hasAssessmentEnded) {
        return null;
      }

      results.push({
        challenge: nextChallenge,
      });

      newAnswers.push(answer);
    }

    const { estimatedLevel } = this.algorithm.getEstimatedLevelAndErrorRate({
      allAnswers: [...challengesAnswers, ...newAnswers],
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
      doubleMeasuresUntil: this.doubleMeasuresUntil,
    });

    return {
      results: results.map((result) => ({ ...result, estimatedLevel })),
      challengeAnswers: newAnswers,
      nextStepIndex: stepIndex + NUMBER_OF_MEASURES,
    };
  }

  _getNextChallengeAndAnswer({ possibleChallenges, stepIndex }) {
    const nextChallenge = this.pickChallenge({ possibleChallenges });

    const answerStatus = this.pickAnswerStatus({
      answerIndex: stepIndex,
      nextChallenge,
    });

    const noMoreAnswerRemaining = !answerStatus;

    if (noMoreAnswerRemaining) {
      return {
        hasAssessmentEnded: true,
      };
    }

    return {
      nextChallenge,
      answer: new Answer({
        result: answerStatus,
        challengeId: nextChallenge.id,
      }),
      hasAssessmentEnded: false,
    };
  }
}
