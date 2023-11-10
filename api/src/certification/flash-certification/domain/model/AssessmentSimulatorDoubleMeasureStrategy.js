import { Answer } from '../../../../evaluation/domain/models/Answer.js';

const NUMBER_OF_MEASURES = 2;
export class AssessmentSimulatorDoubleMeasureStrategy {
  constructor({ algorithm, challenges, pickChallenge, pickAnswerStatus, initialCapacity }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswerStatus = pickAnswerStatus;
    this.pickChallenge = pickChallenge;
    this.initialCapacity = initialCapacity;
  }

  run({ challengesAnswers, stepIndex }) {
    const results = [];
    const challengeAnswers = [];
    const possibleChallenges = this.algorithm.getPossibleNextChallenges({
      allAnswers: challengesAnswers,
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
    });

    for (let index = 0; index < NUMBER_OF_MEASURES; index++) {
      const availableChallenges = possibleChallenges.filter(({ id }) => {
        return challengeAnswers.every(({ challengeId }) => challengeId !== id);
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

      challengeAnswers.push(answer);
    }

    return {
      results,
      challengeAnswers,
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
