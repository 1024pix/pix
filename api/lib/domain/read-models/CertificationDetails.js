const _ = require('lodash');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');

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

  static from({
    certificationAssessment,
    competenceMarks,
    placementProfile,
  }) {
    const reproducibilityRate = ReproducibilityRate.from({ answers: certificationAssessment.certificationAnswersByDate });
    const competencesWithMark = _buildCompetencesWithMark({ competenceMarks, placementProfile });
    const listChallengesAndAnswers = _buildListChallengesAndAnswers({ certificationAssessment, competencesWithMark });

    return new CertificationDetails({
      id: certificationAssessment.certificationCourseId,
      userId: certificationAssessment.userId,
      createdAt: certificationAssessment.createdAt,
      completedAt: certificationAssessment.completedAt,
      status: certificationAssessment.state,
      totalScore: _.sumBy(competenceMarks, 'score'),
      percentageCorrectAnswers: reproducibilityRate.value,
      competencesWithMark,
      listChallengesAndAnswers,
    });
  }
}

function _buildCompetencesWithMark({
  competenceMarks,
  placementProfile,
}) {
  return _.map(competenceMarks, (competenceMark)=> {
    const userCompetence = placementProfile.getUserCompetence(competenceMark.competenceId);

    return {
      areaCode: competenceMark.area_code,
      id: competenceMark.competenceId,
      index: competenceMark.competence_code,
      name: userCompetence.name,
      obtainedLevel: competenceMark.level,
      obtainedScore: competenceMark.score,
      positionedLevel: userCompetence.estimatedLevel,
      positionedScore: userCompetence.pixScore,
    };
  });

}

function _buildListChallengesAndAnswers({
  certificationAssessment,
  competencesWithMark,
}) {
  return _.map(certificationAssessment.certificationAnswersByDate, (certificationAnswer) => {
    const challengeForAnswer = certificationAssessment.getCertificationChallenge(certificationAnswer.challengeId);
    const competenceIndex = _getCompetenceIndexForChallenge(challengeForAnswer, competencesWithMark);

    return {
      challengeId: challengeForAnswer.challengeId,
      competence: competenceIndex,
      result: certificationAnswer.result.status,
      skill: challengeForAnswer.associatedSkillName,
      value: certificationAnswer.value,
    };
  });
}

function _getCompetenceIndexForChallenge(certificationChallenge, competencesWithMark) {
  const competenceWithMark = _.find(competencesWithMark, { id: certificationChallenge.competenceId });
  return competenceWithMark ? competenceWithMark.index : '';
}

module.exports = CertificationDetails;
