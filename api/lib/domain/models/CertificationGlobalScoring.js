const NUMBER_OF_TESTED_CHALLENGES_BY_COMPETENCE = 3;

module.exports = class CertificationGlobalScoring {
  constructor(challengeNeutralizationRate, answeredChallengesRate, challengePropositionRate) {
    this.challengeNeutralizationRate = challengeNeutralizationRate;
    this.answeredChallengesRate = answeredChallengesRate;
    this.challengePropositionRate = challengePropositionRate;
  }

  static from({ answerCollectionForScoring, testedCompetences }) {
    const challengeNeutralizationRate = answerCollectionForScoring.numberOfAnswers() === 0 ? 0 :
      Math.round((answerCollectionForScoring.numberOfNeutralizedChallenges() / answerCollectionForScoring.numberOfAnswers()) * 100);

    const answeredChallengesRate = answerCollectionForScoring.numberOfChallenges() === 0 ? 0 :
      Math.round((answerCollectionForScoring.numberOfAnswers() / answerCollectionForScoring.numberOfChallenges()) * 100);

    const challengePropositionRate = testedCompetences.length === 0 ? 0 :
      Math.round((answerCollectionForScoring.numberOfChallenges() / (testedCompetences.length * NUMBER_OF_TESTED_CHALLENGES_BY_COMPETENCE)) * 100);

    return new CertificationGlobalScoring(challengeNeutralizationRate, answeredChallengesRate, challengePropositionRate);
  }

  hasFailed() {
    return this.challengeNeutralizationRate > 33 || this.answeredChallengesRate < 33 || this.challengePropositionRate < 33;
  }
};
