const _ = require('lodash');
const bluebird = require('bluebird');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Challenge = require('../models/Challenge');
const CertificationProfile = require('../models/CertificationProfile');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../lib/infrastructure/repositories/assessment-result-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const scoringService = require('../../../lib/domain/services/scoring/scoring-service');

async function getCertificationProfile({ userId, limitDate, isV2Certification = true, allowExcessPixAndLevels = true }) {
  const competences = await competenceRepository.listPixCompetencesOnly();
  if (isV2Certification) {
    return _generateCertificationProfileV2({ userId, profileDate: limitDate, competences, allowExcessPixAndLevels });
  }
  return _generateCertificationProfileV1({ userId, profileDate: limitDate, competences });
}

async function fillCertificationProfileWithChallenges(certificationProfile) {
  const certificationProfileClone = _.clone(certificationProfile);
  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: certificationProfile.userId, limitDate: certificationProfile.profileDate });

  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  const challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

  const allChallenges = await challengeRepository.findOperative();
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
      .filter((skill) => _skillHasAtLeastOneChallenge(skill, allChallenges))
      .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
  });

  certificationProfileClone.userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(certificationProfileClone.userCompetences);

  certificationProfileClone.userCompetences.forEach((userCompetence) => {
    const testedSkills = [];
    userCompetence.skills.forEach((skill) => {
      if (!userCompetence.hasEnoughChallenges()) {
        const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allChallenges, skill });
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

function _skillHasAtLeastOneChallenge(skill, challenges) {
  const challengesBySkill = Challenge.findBySkill({ challenges, skill });
  return challengesBySkill.length > 0;
}

async function _createUserCompetencesV1({ allCompetences, userLastAssessments, limitDate }) {
  return bluebird.mapSeries(allCompetences, async (competence) => {
    const assessment = _.find(userLastAssessments, { competenceId: competence.id });
    let estimatedLevel = 0;
    let pixScore = 0;
    if (assessment) {
      const assessmentResultLevelAndPixScore = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({ assessmentId: assessment.id, limitDate });
      estimatedLevel = assessmentResultLevelAndPixScore.level;
      pixScore = assessmentResultLevelAndPixScore.pixScore;
    }
    return new UserCompetence({
      id: competence.id,
      area: competence.area,
      index: competence.index,
      name: competence.name,
      estimatedLevel,
      pixScore,
    });
  });
}

async function _generateCertificationProfileV1({ userId, profileDate, competences }) {
  const certificationProfile = new CertificationProfile({
    userId,
    profileDate,
  });
  const userLastAssessments = await assessmentRepository
    .findLastCompletedAssessmentsForEachCompetenceByUser(certificationProfile.userId, certificationProfile.profileDate);
  certificationProfile.userCompetences = await _createUserCompetencesV1({ allCompetences: competences, userLastAssessments, limitDate: certificationProfile.profileDate });

  return certificationProfile;
}

function _createUserCompetencesV2({ knowledgeElementsByCompetence, allCompetences, allowExcessPixAndLevels = true }) {
  return allCompetences.map((competence) => {
    const {
      pixScoreForCompetence,
      currentLevel,
    } = scoringService.calculateScoringInformationForCompetence({
      knowledgeElements: knowledgeElementsByCompetence[competence.id],
      allowExcessPix: allowExcessPixAndLevels,
      allowExcessLevel: allowExcessPixAndLevels
    });

    return new UserCompetence({
      id: competence.id,
      area: competence.area,
      index: competence.index,
      name: competence.name,
      estimatedLevel: currentLevel,
      pixScore: pixScoreForCompetence,
    });
  });
}

async function _generateCertificationProfileV2({ certificationProfile, competences, allowExcessPixAndLevels }) {
  const certificationProfileToFill = _.clone(certificationProfile);

  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: certificationProfile.userId, limitDate: certificationProfile.profileDate });

  certificationProfileToFill.userCompetences = _createUserCompetencesV2({
    knowledgeElementsByCompetence,
    allCompetences: competences,
    allowExcessPixAndLevels,
  });

  return certificationProfileToFill;
}

async function getCertificationProfilesWithSnapshotting({ userIdsAndDates, competences, allowExcessPixAndLevels = true }) {
  const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository
    .findSnapshotGroupedByCompetencesForUsers(userIdsAndDates);

  const certificationProfilesList = [];
  for (const [strUserId, knowledgeElementsByCompetence] of Object.entries(knowledgeElementsByUserIdAndCompetenceId)) {
    const userId = parseInt(strUserId);
    const certificationProfile = new CertificationProfile({
      userId,
      profileDate: userIdsAndDates[userId],
    });

    certificationProfile.userCompetences = _createUserCompetencesV2({
      knowledgeElementsByCompetence,
      allCompetences: competences,
      allowExcessPixAndLevels,
    });

    certificationProfilesList.push(certificationProfile);
  }

  return certificationProfilesList;
}

module.exports = {
  getCertificationProfile,
  getCertificationProfilesWithSnapshotting,
  fillCertificationProfileWithChallenges,
};
