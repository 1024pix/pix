import _ from 'lodash';
import bluebird from 'bluebird';

import { UserCompetence } from '../models/UserCompetence.js';
import { PlacementProfile } from '../models/PlacementProfile.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as assessmentResultRepository from '../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as scoringService from './scoring/scoring-service.js';
import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';

async function getPlacementProfile({
  userId,
  limitDate,
  version = CertificationVersion.V2,
  allowExcessPixAndLevels = true,
  locale,
}) {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly({ locale });
  if (version !== CertificationVersion.V1) {
    return _generatePlacementProfile({
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
    placementProfile.profileDate,
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
      skillMap,
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

async function _generatePlacementProfile({ userId, profileDate, competences, allowExcessPixAndLevels }) {
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
    await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForProfileCollection(
      userIdsAndDates,
    );

  const placementProfilesList = [];

  knowledgeElementsByUserIdAndCompetenceId.forEach(({ userId, knowledgeElements }) => {
    const userCompetences = _createUserCompetencesV2({
      knowledgeElementsByCompetence: knowledgeElements,
      competences,
      allowExcessPixAndLevels,
    });
    const placementProfile = new PlacementProfile({
      userId,
      profileDate: userIdsAndDates[userId],
      userCompetences,
    });

    placementProfilesList.push(placementProfile);
  });

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

export { getPlacementProfile, getPlacementProfilesWithSnapshotting, getPlacementProfileWithSnapshotting };
