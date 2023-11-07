import { Answer } from '../../../../evaluation/domain/models/Answer.js';

export class AssessmentSimulator {
  constructor({ algorithm, challenges, pickChallenge, pickAnswerStatus, initialCapacity }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswerStatus = pickAnswerStatus;
    this.pickChallenge = pickChallenge;
    this.initialCapacity = initialCapacity;
  }

  _runSimulatorStep({ challengesAnswers, stepIndex }) {
    const possibleChallenges = this.algorithm.getPossibleNextChallenges({
      allAnswers: challengesAnswers,
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
    });

    const nextChallenge = this.pickChallenge({ possibleChallenges });

    const answerStatus = this.pickAnswerStatus({
      answerIndex: stepIndex,
      nextChallenge,
    });

    const noMoreAnswerRemaining = !answerStatus;

    if (noMoreAnswerRemaining) {
      return null;
    }

    const estimatedLevelBeforeAnswering = this.algorithm.getEstimatedLevelAndErrorRate({
      allAnswers: challengesAnswers,
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
    }).estimatedLevel;

    const newAnswers = [...challengesAnswers, new Answer({ result: answerStatus, challengeId: nextChallenge.id })];

    const { estimatedLevel, errorRate } = this.algorithm.getEstimatedLevelAndErrorRate({
      allAnswers: newAnswers,
      challenges: this.challenges,
      initialCapacity: this.initialCapacity,
    });

    const reward = this.algorithm.getReward({
      estimatedLevel: estimatedLevelBeforeAnswering,
      difficulty: nextChallenge.difficulty,
      discriminant: nextChallenge.discriminant,
    });

    return {
      result: {
        challenge: nextChallenge,
        errorRate,
        estimatedLevel,
        reward,
        answerStatus,
      },
      challengesAnswers: newAnswers,
    };
  }

  run() {
    let challengesAnswers = [];
    const result = [];

    for (let i = 0; i < Infinity; i++) {
      try {
        const simulatorStepResult = this._runSimulatorStep({ challengesAnswers, stepIndex: i });

        if (!simulatorStepResult) {
          break;
        }

        challengesAnswers = simulatorStepResult.challengesAnswers;
        result.push(simulatorStepResult.result);
      } catch (err) {
        break;
      }
    }

    return result;
  }
}
