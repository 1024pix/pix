import { Answer } from './Answer.js';

export class AssessmentSimulator {
  constructor({ answers, algorithm, challenges, pickChallenge, pickAnswer }) {
    this.answers = answers;
    this.pickAnswer = pickAnswer;
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickChallenge = pickChallenge;
  }

  #getAnswer({ answerIndex, nextChallenge }) {
    return this.pickAnswer ? this.pickAnswer(nextChallenge) : this.answers[answerIndex];
  }

  run() {
    const challengesAnswers = [];
    const result = [];
    let estimatedLevel = this.algorithm.getEstimatedLevelAndErrorRate({ allAnswers: [] }).estimatedLevel;

    // eslint-disable-next-line no-constant-condition
    for (let i = 0; true; i++) {
      try {
        const possibleChallenges = this.algorithm.getPossibleNextChallenges({
          allAnswers: challengesAnswers,
          challenges: this.challenges,
        });
        const nextChallenge = this.pickChallenge({ possibleChallenges });

        const answer = this.#getAnswer({
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
