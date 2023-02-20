import _ from 'lodash';
import AnswerCollectionForScoring from '../models/AnswerCollectionForScoring';
import { ReproducibilityRate } from '../models/ReproducibilityRate';

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

  static from({ certificationAssessment, competenceMarks, placementProfile }) {
    const answerCollection = AnswerCollectionForScoring.from({
      answers: certificationAssessment.certificationAnswersByDate,
      challenges: certificationAssessment.certificationChallenges,
    });
    const reproducibilityRate = ReproducibilityRate.from({
      numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
      numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
    });
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

  static fromCertificationAssessmentScore({ certificationAssessmentScore, certificationAssessment, placementProfile }) {
    const competenceMarks = certificationAssessmentScore.getCompetenceMarks();
    const competencesWithMark = _buildCompetencesWithMark({ competenceMarks, placementProfile });
    const listChallengesAndAnswers = _buildListChallengesAndAnswers({ certificationAssessment, competencesWithMark });

    return new CertificationDetails({
      id: certificationAssessment.certificationCourseId,
      userId: certificationAssessment.userId,
      createdAt: certificationAssessment.createdAt,
      completedAt: certificationAssessment.completedAt,
      status: certificationAssessment.state,
      totalScore: certificationAssessmentScore.nbPix,
      percentageCorrectAnswers: certificationAssessmentScore.getPercentageCorrectAnswers(),
      competencesWithMark,
      listChallengesAndAnswers,
    });
  }

  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      status: this.status,
      totalScore: this.totalScore,
      percentageCorrectAnswers: this.percentageCorrectAnswers,
      competencesWithMark: _.cloneDeep(this.competencesWithMark),
      listChallengesAndAnswers: _.cloneDeep(this.listChallengesAndAnswers),
    };
  }
}

function _buildCompetencesWithMark({ competenceMarks, placementProfile }) {
  return _.map(competenceMarks, (competenceMark) => {
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

function _buildListChallengesAndAnswers({ certificationAssessment, competencesWithMark }) {
  const answeredChallengesAndAnswers = _.map(
    certificationAssessment.certificationAnswersByDate,
    (certificationAnswer) => {
      const challengeForAnswer = certificationAssessment.getCertificationChallenge(certificationAnswer.challengeId);
      const competenceIndex = _getCompetenceIndexForChallenge(challengeForAnswer, competencesWithMark);

      return {
        challengeId: challengeForAnswer.challengeId,
        competence: competenceIndex,
        isNeutralized: challengeForAnswer.isNeutralized,
        hasBeenSkippedAutomatically: false,
        result: certificationAnswer.result.status,
        skill: challengeForAnswer.associatedSkillName,
        value: certificationAnswer.value,
      };
    }
  );

  const unansweredChallengesAndAnswers = _(certificationAssessment.certificationChallenges)
    .map((challenge) => {
      const answer = certificationAssessment.certificationAnswersByDate.find(
        (answer) => answer.challengeId === challenge.challengeId
      );
      if (answer) {
        return null;
      }
      const competenceIndex = _getCompetenceIndexForChallenge(challenge, competencesWithMark);
      return {
        challengeId: challenge.challengeId,
        competence: competenceIndex,
        isNeutralized: challenge.isNeutralized,
        hasBeenSkippedAutomatically: challenge.hasBeenSkippedAutomatically,
        result: undefined,
        skill: challenge.associatedSkillName,
        value: undefined,
      };
    })
    .compact()
    .sortBy('competence')
    .value();

  return answeredChallengesAndAnswers.concat(unansweredChallengesAndAnswers);
}

function _getCompetenceIndexForChallenge(certificationChallenge, competencesWithMark) {
  const competenceWithMark = _.find(competencesWithMark, { id: certificationChallenge.competenceId });
  return competenceWithMark ? competenceWithMark.index : '';
}

export default CertificationDetails;
