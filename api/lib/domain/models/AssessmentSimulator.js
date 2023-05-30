import { Answer } from './Answer.js';

export class AssessmentSimulator {
  constructor({ algorithm, challenges, pickChallenge, pickAnswer, stopAtChallenge }) {
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickAnswer = pickAnswer;
    this.pickChallenge = pickChallenge;
    this.stopAtChallenge = stopAtChallenge;
  }

  run() {
    const challengesAnswers = [];
    const result = [];
    let estimatedLevel = this.algorithm.getEstimatedLevelAndErrorRate({ allAnswers: [] }).estimatedLevel;
    const maxChallenge = this.stopAtChallenge || Infinity;

    for (let i = 0; i < maxChallenge; i++) {
      try {
        const possibleChallenges = this.algorithm.getPossibleNextChallenges({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
          estimatedLevel,
        });
        const nextChallenge = this.pickChallenge({ possibleChallenges });

        const answer = this.pickAnswer({
          answerIndex: i,
          nextChallenge,
        });

        if (!answer) {
          break;
        }

        challengesAnswers.push(new Answer({ result: answer, challengeId: nextChallenge.id }));

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
          answer,
        });
      } catch (err) {
        break;
      }
    }

    return result;
  }
}
