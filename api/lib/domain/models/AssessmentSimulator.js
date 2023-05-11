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
    const takenChallenges = [];
    let estimatedLevel;

    for (let i = 0; i < this.answers.length; i++) {
      const result = this.answers[i];
      const possibleChallenges = this.algorithm.getPossibleNextChallenges({
        allAnswers: challengesAnswers,
        challenges: this.challenges,
      });

      const nextChallenge = this.pickChallenge({ possibleChallenges });

      takenChallenges.push(nextChallenge);
      challengesAnswers.push(new Answer({ result, challengeId: nextChallenge.id }));

      estimatedLevel = this.algorithm.getEstimatedLevelAndErrorRate({
        allAnswers: challengesAnswers,
        challenges: this.challenges,
      }).estimatedLevel;
    }

    return {
      estimatedLevel,
      challenges: takenChallenges,
    };
  }
};
