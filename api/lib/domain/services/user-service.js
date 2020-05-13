const _ = require('lodash');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Challenge = require('../models/Challenge');
const Scorecard = require('../models/Scorecard');
const CertificationProfile = require('../models/CertificationProfile');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');

async function getCertificationProfile({ userId, limitDate, competences, isV2Certification = true, limitPixAndLevels = false }) {
  const certificationProfile = new CertificationProfile({
    userId,
    profileDate: limitDate,
  });
  if (isV2Certification) {
    return _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV2({ certificationProfile, competences, limitPixAndLevels });
  }
  return _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV1({ certificationProfile, competences });
}

async function fillCertificationProfileWithChallenges(certificationProfile) {
  const certificationProfileClone = _.clone(certificationProfile);
  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: certificationProfile.userId, limitDate: certificationProfile.profileDate });

  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  const challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

  const allChallenges = await challengeRepository.list();
  const challengesAlreadyAnswered = challengeIdsCorrectlyAnswered.map((challengeId) => Challenge.findById(allChallenges, challengeId));

  challengesAlreadyAnswered.forEach((challenge) => {
    if (!challenge) {
      return;
    }

    const userCompetence = _getUserCompetenceByChallengeCompetenceId(certificationProfileClone.userCompetences, challenge);

    if (!userCompetence || !userCompetence.isCertifiable()) {
      return;
    }

    challenge.skills
      .filter((skill) => _skillHasAtLeastOneChallengeInTheReferentiel(skill, allChallenges))
      .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
  });

  certificationProfileClone.userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(certificationProfileClone.userCompetences);

  certificationProfileClone.userCompetences.forEach((userCompetence) => {
    const testedSkills = [];
    userCompetence.skills.forEach((skill) => {
      if (!userCompetence.hasEnoughChallenges()) {
        const challengesToValidateCurrentSkill = Challenge.findPublishedBySkill(allChallenges, skill);
        const challengesLeftToAnswer = _.difference(challengesToValidateCurrentSkill, challengesAlreadyAnswered);

        const challengesPoolToPickChallengeFrom = (_.isEmpty(challengesLeftToAnswer)) ? challengesToValidateCurrentSkill : challengesLeftToAnswer;
        const challenge = _.sample(challengesPoolToPickChallengeFrom);

        challenge.testedSkill = skill;
        testedSkills.push(skill);

        userCompetence.addChallenge(challenge);
      }
    });
    userCompetence.skills = testedSkills;
  });

  return certificationProfileClone;
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

async function _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV1({ certificationProfile, competences }) {
  const certificationProfileToFill = _.clone(certificationProfile);
  const userLastAssessments = await assessmentRepository
    .findLastCompletedAssessmentsForEachCompetenceByUser(certificationProfile.userId, certificationProfile.profileDate);
  certificationProfileToFill.userCompetences = _createUserCompetencesV1({ allCompetences: competences, userLastAssessments });

  return certificationProfileToFill;
}

function _createUserCompetencesV2({ userId, knowledgeElementsByCompetence, allCompetences, limitPixAndLevels = false }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);

    const scorecard = Scorecard.buildFrom({
      userId,
      knowledgeElements: knowledgeElementsByCompetence[competence.id],
      competence,
      allowExcessPix: !limitPixAndLevels,
      allowExcessLevel: !limitPixAndLevels,
    });

    userCompetence.estimatedLevel = scorecard.level;
    userCompetence.pixScore = scorecard.earnedPix;

    return userCompetence;
  });
}

async function _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV2({ certificationProfile, competences, limitPixAndLevels }) {
  const certificationProfileToFill = _.clone(certificationProfile);

  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: certificationProfile.userId, limitDate: certificationProfile.profileDate });

  certificationProfileToFill.userCompetences = _createUserCompetencesV2({
    userId: certificationProfile.userId,
    knowledgeElementsByCompetence,
    allCompetences: competences,
    limitPixAndLevels,
  });

  return certificationProfileToFill;
}

module.exports = {
  getCertificationProfile,
  fillCertificationProfileWithChallenges,
};
