const _ = require('lodash');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Challenge = require('../models/Challenge');
const Scorecard = require('../models/Scorecard');
const CertificationProfile = require('../models/CertificationProfile');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');

async function getCertificationProfile({ userId, limitDate, isV2Certification = true }) {
  const certificationProfile = new CertificationProfile({
    userId,
    profileDate: limitDate,
  });
  if (isV2Certification) {
    return _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV2(certificationProfile);
  }
  return _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV1(certificationProfile);
}

async function fillCertificationProfileWithCertificationChallenges(certificationProfile) {
  const allChallenges = await challengeRepository.list();
  const challengesAlreadyAnswered = certificationProfile.challengeIdsCorrectlyAnswered.map((challengeId) => Challenge.findById(allChallenges, challengeId));

  challengesAlreadyAnswered.forEach((challenge) => {
    if (!challenge) {
      return;
    }

    const userCompetence = _getUserCompetenceByChallengeCompetenceId(certificationProfile.userCompetences, challenge);

    if (!userCompetence || !userCompetence.isCertifiable()) {
      return;
    }

    challenge.skills
      .filter((skill) => _skillHasAtLeastOneChallengeInTheReferentiel(skill, allChallenges))
      .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
  });

  certificationProfile.userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(certificationProfile.userCompetences);

  certificationProfile.userCompetences.forEach((userCompetence) => {
    const testedSkills = [];
    userCompetence.skills.forEach((skill) => {
      if (!userCompetence.hasEnoughChallenges()) {
        const challengesToValidateCurrentSkill = Challenge.findPublishedBySkill(allChallenges, skill);
        const challengesLeftToAnswer = _.difference(challengesToValidateCurrentSkill, challengesAlreadyAnswered);

        const challengesPoolToPickChallengeFrom = (_.isEmpty(challengesLeftToAnswer)) ? challengesToValidateCurrentSkill : challengesLeftToAnswer;
        const challenge = _.sample(challengesPoolToPickChallengeFrom);

        //TODO : Mettre le skill en entier (Skill{id, name})
        challenge.testedSkill = skill.name;
        testedSkills.push(skill);

        userCompetence.addChallenge(challenge);
      }
    });
    userCompetence.skills = testedSkills;
  });

  return certificationProfile;
}

async function _findCorrectAnswersByAssessments(assessments) {
  const answersByAssessmentsPromises = assessments.map((assessment) =>
    answerRepository.findCorrectAnswersByAssessmentId(assessment.id));

  const answersByAssessments = await Promise.all(answersByAssessmentsPromises);

  return _.flatten(answersByAssessments);
}

function _getUserCompetenceByChallengeCompetenceId(userCompetences, challenge) {
  return challenge ? userCompetences.find((userCompetence) => userCompetence.id === challenge.competenceId) : null;
}

function _skillHasAtLeastOneChallengeInTheReferentiel(skill, challenges) {
  const challengesBySkill = Challenge.findPublishedBySkill(challenges, skill);
  return challengesBySkill.length > 0;
}

function _createUserCompetencesV1({ allCompetences, userLastAssessments }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);
    const assessment = _.find(userLastAssessments, { competenceId: userCompetence.id });
    userCompetence.pixScore = assessment && assessment.getPixScore() || 0;
    userCompetence.estimatedLevel = assessment && assessment.getLevel() || 0;
    return userCompetence;
  });
}

async function _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV1(certificationProfile) {
  const certificationProfileToFill = _.clone(certificationProfile);
  const allCompetences = await competenceRepository.listPixCompetencesOnly();
  const userLastAssessments = await assessmentRepository
    .findLastCompletedAssessmentsForEachCompetenceByUser(certificationProfile.userId, certificationProfile.profileDate);
  certificationProfileToFill.userCompetences = _createUserCompetencesV1({ allCompetences, userLastAssessments });
  const correctAnswers = await _findCorrectAnswersByAssessments(userLastAssessments);
  certificationProfileToFill.challengeIdsCorrectlyAnswered = _.map(correctAnswers, 'challengeId');

  return certificationProfileToFill;
}

function _createUserCompetencesV2({ userId, knowledgeElementsByCompetence, allCompetences }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);

    const scorecard = Scorecard.buildFrom({
      userId,
      knowledgeElements: knowledgeElementsByCompetence[competence.id],
      competence,
      allowExcessPix: true,
      allowExcessLevel: true
    });

    userCompetence.estimatedLevel = scorecard.level;
    userCompetence.pixScore = scorecard.earnedPix;

    return userCompetence;
  });
}

async function _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV2(certificationProfile) {
  const certificationProfileToFill = _.clone(certificationProfile);
  const allCompetences = await competenceRepository.listPixCompetencesOnly();

  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: certificationProfile.userId, limitDate: certificationProfile.profileDate });
  certificationProfileToFill.userCompetences = _createUserCompetencesV2({ userId: certificationProfile.userId, knowledgeElementsByCompetence, allCompetences });

  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  certificationProfileToFill.challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

  return certificationProfileToFill;
}

module.exports = {
  getCertificationProfile,
  fillCertificationProfileWithCertificationChallenges,
};
