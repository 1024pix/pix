import { Answer } from './Answer.js';

export class AssessmentSimulator {
  constructor({ algorithm, challenges, pickChallenge, pickAnswerStatus, stopAtChallenge, initialCapacity }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswerStatus = pickAnswerStatus;
    this.pickChallenge = pickChallenge;
    this.stopAtChallenge = stopAtChallenge;
    this.initialCapacity = initialCapacity;
  }

  run() {
    const challengesAnswers = [];
    const result = [];
    let estimatedLevel =
      this.initialCapacity ?? this.algorithm.getEstimatedLevelAndErrorRate({ allAnswers: [] }).estimatedLevel;
    const maxChallenge = this.stopAtChallenge || Infinity;

    for (let i = 0; i < maxChallenge; i++) {
      try {
        const possibleChallenges = this.algorithm.getPossibleNextChallenges({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
          estimatedLevel,
        });
        const nextChallenge = this.pickChallenge({ possibleChallenges });

        const answerStatus = this.pickAnswerStatus({
          answerIndex: i,
          nextChallenge,
        });

        if (!answerStatus) {
          break;
        }

        challengesAnswers.push(new Answer({ result: answerStatus, challengeId: nextChallenge.id }));

        const reward = this.algorithm.getReward({
          estimatedLevel,
          difficulty: nextChallenge.difficulty,
          discriminant: nextChallenge.discriminant,
        });

        estimatedLevel = this.algorithm.getEstimatedLevelAndErrorRate({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
        }).estimatedLevel;

        const errorRate = this.algorithm.getEstimatedLevelAndErrorRate({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
        }).errorRate;

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
