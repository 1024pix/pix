class CertificationDetails {
  constructor({
    id,
    userId,
    createdAt,
    completedAt,
    status,
    totalScore,
    percentageCorrectAnswers,
    competencesWithMark,
    listChallengesAndAnswers,
  }) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.status = status;
    this.totalScore = totalScore;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this.competencesWithMark = competencesWithMark;
    this.listChallengesAndAnswers = listChallengesAndAnswers;
  }
}

module.exports = {
  CertificationDetails,
};
