import { Answer } from '../../../../evaluation/domain/models/Answer.js';

export class AssessmentSimulator {
  constructor({ algorithm, challenges, pickChallenge, pickAnswerStatus, initialCapacity }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswerStatus = pickAnswerStatus;
    this.pickChallenge = pickChallenge;
    this.initialCapacity = initialCapacity;
  }

  run() {
    const challengesAnswers = [];
    const result = [];

    for (let i = 0; i < Infinity; i++) {
      try {
        const possibleChallenges = this.algorithm.getPossibleNextChallenges({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
          initialCapacity: this.initialCapacity,
        });

        const nextChallenge = this.pickChallenge({ possibleChallenges });

        const answerStatus = this.pickAnswerStatus({
          answerIndex: i,
          nextChallenge,
        });

        const noMoreAnswerRemaining = !answerStatus;

        if (noMoreAnswerRemaining) {
          break;
        }

        const estimatedLevelBeforeAnswering = this.algorithm.getEstimatedLevelAndErrorRate({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
          initialCapacity: this.initialCapacity,
        }).estimatedLevel;

        challengesAnswers.push(new Answer({ result: answerStatus, challengeId: nextChallenge.id }));
        const { estimatedLevel, errorRate } = this.algorithm.getEstimatedLevelAndErrorRate({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
          initialCapacity: this.initialCapacity,
        });

        const reward = this.algorithm.getReward({
          estimatedLevel: estimatedLevelBeforeAnswering,
          difficulty: nextChallenge.difficulty,
          discriminant: nextChallenge.discriminant,
        });

        result.push({
          challenge: nextChallenge,
          errorRate,
          estimatedLevel,
          reward,
          answerStatus,
        });
      } catch (err) {
        break;
      }
    }

    return result;
  }
}
