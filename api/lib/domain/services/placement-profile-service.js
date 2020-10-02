const _ = require('lodash');
const bluebird = require('bluebird');

const UserCompetence = require('../models/UserCompetence');
const PlacementProfile = require('../models/PlacementProfile');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const scoringService = require('./scoring/scoring-service');

async function getPlacementProfile({ userId, limitDate, isV2Certification = true, allowExcessPixAndLevels = true }) {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly();
  if (isV2Certification) {
    return _generatePlacementProfileV2({ userId, profileDate: limitDate, competences: pixCompetences, allowExcessPixAndLevels });
  }
  return _generatePlacementProfileV1({ userId, profileDate: limitDate, competences: pixCompetences });
}

async function _createUserCompetencesV1({ competences, userLastAssessments, limitDate }) {
  return bluebird.mapSeries(competences, async (competence) => {
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
  placementProfile.userCompetences = await _createUserCompetencesV1({ competences, userLastAssessments, limitDate: placementProfile.profileDate });

  return placementProfile;
}

function _createUserCompetencesV2({
  knowledgeElementsByCompetence,
  competences,
  allowExcessPixAndLevels = true,
  skills = [],
}) {

  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));

  return competences.map((competence) => {

    const knowledgeElementsForCompetence = knowledgeElementsByCompetence[competence.id] || [];

    const {
      pixScoreForCompetence,
      currentLevel,
    } = scoringService.calculateScoringInformationForCompetence({
      knowledgeElements: knowledgeElementsForCompetence,
      allowExcessPix: allowExcessPixAndLevels,
      allowExcessLevel: allowExcessPixAndLevels,
    });

    const directlyValidatedCompetenceSkills = _matchingDirectlyValidatedSkillsForCompetence(knowledgeElementsForCompetence, skillMap);

    return new UserCompetence({
      id: competence.id,
      area: competence.area,
      index: competence.index,
      name: competence.name,
      estimatedLevel: currentLevel,
      pixScore: pixScoreForCompetence,
      skills: directlyValidatedCompetenceSkills,
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

  const skills = await skillRepository.list();

  placementProfile.userCompetences = _createUserCompetencesV2({
    knowledgeElementsByCompetence,
    competences,
    allowExcessPixAndLevels,
    skills,
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
      competences,
      allowExcessPixAndLevels,
    });

    placementProfilesList.push(placementProfile);
  }

  return placementProfilesList;
}

function _matchingDirectlyValidatedSkillsForCompetence(knowledgeElementsForCompetence, skillMap) {
  const competenceSkills = knowledgeElementsForCompetence
    .filter((ke) => ke.isDirectlyValidated())
    .map((ke) => {
      return skillMap.get(ke.skillId);
    });

  return _.compact(competenceSkills);
}

module.exports = {
  getPlacementProfile,
  getPlacementProfilesWithSnapshotting,
};
