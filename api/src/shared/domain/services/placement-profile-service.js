import bluebird from 'bluebird';
import _ from 'lodash';

import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { PlacementProfile } from '../../../../src/shared/domain/models/PlacementProfile.js';
import { UserCompetence } from '../../../../src/shared/domain/models/UserCompetence.js';
import {
  CERTIFICATION_VERSIONS,
  CertificationVersion,
} from '../../../certification/shared/domain/models/CertificationVersion.js';
import * as scoringService from '../../../evaluation/domain/services/scoring/scoring-service.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';

async function getPlacementProfile({
  userId,
  limitDate,
  version = CERTIFICATION_VERSIONS.V2,
  allowExcessPixAndLevels = true,
  locale,
}) {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly({ locale });
  if (!CertificationVersion.isV1(version)) {
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
  const knowledgeElementsByUserIdAndDates =
    await knowledgeElementSnapshotRepository.findMultipleUsersFromUserIdsAndSnappedAtDates(userIdsAndDates);

  return userIdsAndDates.map(({ userId, sharedAt }) => {
    const keForUser = knowledgeElementsByUserIdAndDates.find((knowledgeElementsByUserIdAndDates) => {
      const sameUserId = knowledgeElementsByUserIdAndDates.userId === userId;
      const sameDate = sharedAt && knowledgeElementsByUserIdAndDates.snappedAt.getTime() === sharedAt.getTime();

      return sameUserId && sameDate;
    });

    const knowledgeElementsByCompetence = keForUser ? _.groupBy(keForUser.knowledgeElements, 'competenceId') : [];

    const userCompetences = _createUserCompetencesV2({
      knowledgeElementsByCompetence,
      competences,
      allowExcessPixAndLevels,
    });

    return new PlacementProfile({
      userId,
      profileDate: sharedAt,
      userCompetences,
    });
  });
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
