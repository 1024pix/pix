const _ = require('lodash');
const bluebird = require('bluebird');

const UserCompetence = require('../models/UserCompetence.js');
const PlacementProfile = require('../models/PlacementProfile.js');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository.js');
const skillRepository = require('../../infrastructure/repositories/skill-repository.js');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository.js');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const competenceRepository = require('../../infrastructure/repositories/competence-repository.js');
const scoringService = require('./scoring/scoring-service.js');

async function getPlacementProfile({
  userId,
  limitDate,
  isV2Certification = true,
  allowExcessPixAndLevels = true,
  locale,
}) {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly({ locale });
  if (isV2Certification) {
    return _generatePlacementProfileV2({
      userId,
      profileDate: limitDate,
      competences: pixCompetences,
      allowExcessPixAndLevels,
    });
  }
  return _generatePlacementProfileV1({ userId, profileDate: limitDate, competences: pixCompetences });
}

async function _createUserCompetencesV1({ competences, userLastAssessments, limitDate }) {
  return bluebird.mapSeries(competences, async (competence) => {
    const assessment = _.find(userLastAssessments, { competenceId: competence.id });
    let estimatedLevel = 0;
    let pixScore = 0;
    if (assessment) {
      const assessmentResultLevelAndPixScore =
        await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({
          assessmentId: assessment.id,
          limitDate,
        });
      estimatedLevel = assessmentResultLevelAndPixScore.level;
      pixScore = assessmentResultLevelAndPixScore.pixScore;
    }
    return new UserCompetence({
      id: competence.id,
      areaId: competence.areaId,
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
  const userLastAssessments = await assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser(
    placementProfile.userId,
    placementProfile.profileDate
  );
  placementProfile.userCompetences = await _createUserCompetencesV1({
    competences,
    userLastAssessments,
    limitDate: placementProfile.profileDate,
  });

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

    const { pixScoreForCompetence, currentLevel } = scoringService.calculateScoringInformationForCompetence({
      knowledgeElements: knowledgeElementsForCompetence,
      allowExcessPix: allowExcessPixAndLevels,
      allowExcessLevel: allowExcessPixAndLevels,
    });

    const directlyValidatedCompetenceSkills = _matchingDirectlyValidatedSkillsForCompetence(
      knowledgeElementsForCompetence,
      skillMap
    );
    return new UserCompetence({
      id: competence.id,
      areaId: competence.areaId,
      index: competence.index,
      name: competence.name,
      estimatedLevel: currentLevel,
      pixScore: pixScoreForCompetence,
      skills: directlyValidatedCompetenceSkills,
    });
  });
}

async function _generatePlacementProfileV2({ userId, profileDate, competences, allowExcessPixAndLevels }) {
  const knowledgeElementsByCompetence = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
    userId,
    limitDate: profileDate,
  });

  const skills = await skillRepository.list();

  const userCompetences = _createUserCompetencesV2({
    knowledgeElementsByCompetence,
    competences,
    allowExcessPixAndLevels,
    skills,
  });

  return new PlacementProfile({
    userId,
    profileDate,
    userCompetences,
  });
}

async function getPlacementProfilesWithSnapshotting({ userIdsAndDates, competences, allowExcessPixAndLevels = true }) {
  const knowledgeElementsByUserIdAndCompetenceId =
    await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers(userIdsAndDates);

  const placementProfilesList = [];
  for (const [strUserId, knowledgeElementsByCompetence] of Object.entries(knowledgeElementsByUserIdAndCompetenceId)) {
    const userId = parseInt(strUserId);

    const userCompetences = _createUserCompetencesV2({
      knowledgeElementsByCompetence,
      competences,
      allowExcessPixAndLevels,
    });
    const placementProfile = new PlacementProfile({
      userId,
      profileDate: userIdsAndDates[userId],
      userCompetences,
    });

    placementProfilesList.push(placementProfile);
  }

  return placementProfilesList;
}

async function getPlacementProfileWithSnapshotting({ userId, limitDate, competences, allowExcessPixAndLevels = true }) {
  const snapshots = await knowledgeElementRepository.findSnapshotForUsers({
    [userId]: limitDate,
  });
  const knowledgeElements = snapshots[userId];
  const knowledgeElementsByCompetence = _.groupBy(knowledgeElements, 'competenceId');

  const userCompetences = _createUserCompetencesV2({
    knowledgeElementsByCompetence,
    competences,
    allowExcessPixAndLevels,
  });
  return new PlacementProfile({
    userId,
    profileDate: limitDate,
    userCompetences,
  });
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
  getPlacementProfileWithSnapshotting,
};
