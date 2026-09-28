import { AnswerCollectionForScoring } from '../../../shared/domain/models/AnswerCollectionForScoring.js';
import { ReproducibilityRate } from '../../../shared/domain/models/ReproducibilityRate.js';

export class CertificationDetails {
  constructor({
    id,
    userId,
    createdAt,
    lastAnswerAt,
    status,
    totalScore,
    percentageCorrectAnswers,
    competencesWithMark,
    listChallengesAndAnswers,
  }) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.lastAnswerAt = lastAnswerAt;
    this.status = status;
    this.totalScore = totalScore;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this.competencesWithMark = competencesWithMark;
    this.listChallengesAndAnswers = listChallengesAndAnswers;
  }

  static from({ certificationAssessment, competenceMarks = [], placementProfile }) {
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

    const totalScore = competenceMarks.reduce((score, competenceMark) => score + competenceMark.score, 0);

    return new CertificationDetails({
      id: certificationAssessment.certificationCourseId,
      userId: certificationAssessment.userId,
      createdAt: certificationAssessment.createdAt,
      lastAnswerAt: certificationAssessment.lastAnswerAt,
      status: certificationAssessment.state,
      totalScore,
      percentageCorrectAnswers: reproducibilityRate.value,
      competencesWithMark,
      listChallengesAndAnswers,
    });
  }

  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      lastAnswerAt: this.lastAnswerAt,
      status: this.status,
      totalScore: this.totalScore,
      percentageCorrectAnswers: this.percentageCorrectAnswers,
      competencesWithMark: structuredClone(this.competencesWithMark),
      listChallengesAndAnswers: structuredClone(this.listChallengesAndAnswers),
    };
  }
}

function _buildCompetencesWithMark({ competenceMarks, placementProfile }) {
  if (!placementProfile) {
    return;
  }

  return competenceMarks.map((competenceMark) => {
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
  const answeredChallengesAndAnswers = certificationAssessment.certificationAnswersByDate.map((certificationAnswer) => {
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
  });

  const unansweredChallengesAndAnswers = certificationAssessment.certificationChallenges
    .map((challenge) => {
      const answer = certificationAssessment.certificationAnswersByDate.find(
        (answer) => answer.challengeId === challenge.challengeId,
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
    .filter(Boolean)
    .toSorted((a, b) => (a['competence'] > b['competence'] ? 1 : a['competence'] < b['competence'] ? -1 : 0));

  return answeredChallengesAndAnswers.concat(Object.values(unansweredChallengesAndAnswers));
}

function _getCompetenceIndexForChallenge(certificationChallenge, competencesWithMark) {
  const competenceWithMark = competencesWithMark?.find(
    (competenceWithMark) => competenceWithMark.id === certificationChallenge.competenceId,
  );
  return competenceWithMark ? competenceWithMark.index : '';
}
