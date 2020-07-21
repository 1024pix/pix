const _ = require('lodash');
const bluebird = require('bluebird');

const KnowledgeElement = require('../models/KnowledgeElement');
const UserCompetence = require('../models/UserCompetence');
const Challenge = require('../models/Challenge');
const PlacementProfile = require('../models/PlacementProfile');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const scoringService = require('./scoring/scoring-service');

async function getPlacementProfile({ userId, limitDate, isV2Certification = true, allowExcessPixAndLevels = true }) {
  const competences = await competenceRepository.listPixCompetencesOnly();
  if (isV2Certification) {
    return _generatePlacementProfileV2({ userId, profileDate: limitDate, competences, allowExcessPixAndLevels });
  }
  return _generatePlacementProfileV1({ userId, profileDate: limitDate, competences });
}

//TODO: Refacto ce n'est pas la responsabilité du placementProfile d'avoir les questions de certifications
async function fillPlacementProfileWithChallenges(placementProfile) {
  const placementClone = _.clone(placementProfile);
  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: placementProfile.userId, limitDate: placementProfile.profileDate });

  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  const challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

  const allChallenges = await challengeRepository.findOperative();
  const challengesAlreadyAnswered = challengeIdsCorrectlyAnswered.map((challengeId) => Challenge.findById(allChallenges, challengeId));

  challengesAlreadyAnswered.forEach((challenge) => {
    if (!challenge) {
      return;
    }

    const userCompetence = _getUserCompetenceByChallengeCompetenceId(placementClone.userCompetences, challenge);

    if (!userCompetence || !userCompetence.isCertifiable()) {
      return;
    }

    challenge.skills
      .filter((skill) => _skillHasAtLeastOneChallenge(skill, allChallenges))
      .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
  });

  placementClone.userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(placementClone.userCompetences);

  placementClone.userCompetences.forEach((userCompetence) => {
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

  return placementClone;
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

async function _generatePlacementProfileV1({ userId, profileDate, competences }) {
  const placementProfile = new PlacementProfile({
    userId,
    profileDate,
  });
  const userLastAssessments = await assessmentRepository
    .findLastCompletedAssessmentsForEachCompetenceByUser(placementProfile.userId, placementProfile.profileDate);
  placementProfile.userCompetences = await _createUserCompetencesV1({ allCompetences: competences, userLastAssessments, limitDate: placementProfile.profileDate });

  return placementProfile;
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

async function _generatePlacementProfileV2({ userId, profileDate, competences, allowExcessPixAndLevels }) {
  const placementProfile = new PlacementProfile({
    userId,
    profileDate,
  });

  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: placementProfile.userId, limitDate: placementProfile.profileDate });

  placementProfile.userCompetences = _createUserCompetencesV2({
    knowledgeElementsByCompetence,
    allCompetences: competences,
    allowExcessPixAndLevels,
  });

  return placementProfile;
}

async function getPlacementProfilesWithSnapshotting({ userIdsAndDates, competences, allowExcessPixAndLevels = true }) {
  const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository
    .findSnapshotGroupedByCompetencesForUsers(userIdsAndDates);

  const placementProfilesList = [];
  for (const [strUserId, knowledgeElementsByCompetence] of Object.entries(knowledgeElementsByUserIdAndCompetenceId)) {
    const userId = parseInt(strUserId);
    const placementProfile = new PlacementProfile({
      userId,
      profileDate: userIdsAndDates[userId],
    });

    placementProfile.userCompetences = _createUserCompetencesV2({
      knowledgeElementsByCompetence,
      allCompetences: competences,
      allowExcessPixAndLevels,
    });

    placementProfilesList.push(placementProfile);
  }

  return placementProfilesList;
}

module.exports = {
  getPlacementProfile,
  getPlacementProfilesWithSnapshotting,
  fillPlacementProfileWithChallenges,
};
