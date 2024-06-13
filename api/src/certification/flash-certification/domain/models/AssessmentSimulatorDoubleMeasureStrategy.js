import { Answer } from '../../../../evaluation/domain/models/Answer.js';

const NUMBER_OF_MEASURES = 2;
export class AssessmentSimulatorDoubleMeasureStrategy {
  constructor({
    algorithm,
    challenges,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
    doubleMeasuresUntil,
    challengePickProbability,
  }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswerStatus = pickAnswerStatus;
    this.pickChallenge = pickChallenge;
    this.challengePickProbability = challengePickProbability;
    this.initialCapacity = initialCapacity;
    this.doubleMeasuresUntil = doubleMeasuresUntil;
  }

  run({ challengesAnswers, stepIndex }) {
    const results = [];
    const newAnswers = [];

    const { capacity: capacityBefore } = this.algorithm.getCapacityAndErrorRate({
      allAnswers: challengesAnswers,
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
      doubleMeasuresUntil: this.doubleMeasuresUntil,
    });

    for (let index = 0; index < NUMBER_OF_MEASURES; index++) {
      const possibleChallenges = this.algorithm.getPossibleNextChallenges({
        assessmentAnswers: [...challengesAnswers, ...newAnswers],
        challenges: this.challenges,
        initialCapacity: this.initialCapacity,
        answersForComputingCapacity: challengesAnswers,
      });

      const availableChallenges = possibleChallenges.filter(({ id }) => {
        return newAnswers.every(({ challengeId }) => challengeId !== id);
      });
      const { hasAssessmentEnded, nextChallenge, answer } = this._getNextChallengeAndAnswer({
        possibleChallenges: availableChallenges,
        stepIndex: stepIndex + index,
        challengePickProbability: this.challengePickProbability,
      });

      if (hasAssessmentEnded) {
        return null;
      }

      const reward = this.algorithm.getReward({
        capacity: capacityBefore,
        difficulty: nextChallenge.difficulty,
        discriminant: nextChallenge.discriminant,
      });

      results.push({
        challenge: nextChallenge,
        answerStatus: answer.result.status,
        reward,
      });

      newAnswers.push(answer);
    }

    const { capacity } = this.algorithm.getCapacityAndErrorRate({
      allAnswers: [...challengesAnswers, ...newAnswers],
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
      doubleMeasuresUntil: this.doubleMeasuresUntil,
    });

    return {
      results: results.map((result) => ({ ...result, capacity })),
      challengeAnswers: newAnswers,
      nextStepIndex: stepIndex + NUMBER_OF_MEASURES,
    };
  }

  _getNextChallengeAndAnswer({ possibleChallenges, stepIndex, challengePickProbability }) {
    const nextChallenge = this.pickChallenge.chooseNextChallenge(challengePickProbability)({ possibleChallenges });

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
