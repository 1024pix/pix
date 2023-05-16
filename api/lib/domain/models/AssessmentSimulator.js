import { Answer } from './Answer.js';

export class AssessmentSimulator {
  constructor({ answers, algorithm, challenges, pickChallenge }) {
    this.answers = answers;
    this.algorithm = algorithm;
    this.challenges = challenges;
    this.pickChallenge = pickChallenge;
  }

  run() {
    const challengesAnswers = [];
    const result = [];
    let estimatedLevel = this.algorithm.getEstimatedLevelAndErrorRate({ allAnswers: [] }).estimatedLevel;

    for (let i = 0; i < this.answers.length; i++) {
      const answer = this.answers[i];
      const possibleChallenges = this.algorithm.getPossibleNextChallenges({
        allAnswers: challengesAnswers,
        challenges: this.challenges,
      });

      const nextChallenge = this.pickChallenge({ possibleChallenges });

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
      });
    }

    return result;
  }
}
