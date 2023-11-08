import { LearningContentResourceNotFound } from '../../../../lib/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { Challenge } from '../../../../lib/domain/models/index.js';
import {
  challengeDatasource,
  skillDatasource,
  tubeDatasource,
} from '../../../../lib/infrastructure/datasources/learning-content/index.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import { Activity } from '../../../school/domain/models/Activity.js';
import * as solutionAdapter from '../../../../lib/infrastructure/adapters/solution-adapter.js';

/**
 *
 * Pour Pix1D, les missions ont été stockées dans le LCMS de la manière suivante :
 * - un theme est une mission
 * - un sujet est une activité
 * - une épreuve reste une épreuve
 * - le niveau de l'épreuve est utilisé pour gérer l'ordre de passage des épreuves dans l'activité
 *
 * Les noms des activités doivent respecter une norme pour Pix1D :
 * `[mission name prefix]_[activity level]`
 *
 * Les épreuves sont automatiquement nommées à partir du nom des activités, avec un numéro en suffixe.
 *
 * @param {string} missionId technical ID for theme
 * @param {string} activityLevel activity level name
 * @param {number} challengeNumber activity's challenge number
 * @returns a challenge
 */
const getChallengeFor1d = async function ({ missionId, activityLevel, challengeNumber, locale }) {
  try {
    const missionNamePrefix = await _getMissionNamePrefix(missionId);
    if (missionNamePrefix.length === 0) {
      throw new NotFoundError(`Aucune mission trouvée pour l'identifiant : ${missionId}`);
    }
    const skillNamePrefix = _getPix1dActivityLevelTubeName(missionNamePrefix, activityLevel);
    const skillName = `${skillNamePrefix}${challengeNumber}`;
    const skills = await skillDatasource.findAllSkillsByNameForPix1d(skillName);
    if (skills.length === 0) {
      throw new NotFoundError(
        `Aucun acquis trouvé pour la mission : ${missionId}, le niveau ${activityLevel} et le numéro ${challengeNumber}`,
      );
    }
    if (skills.length > 1) {
      logger.warn(`Plus d'un acquis trouvé avec le nom ${skillName}. Le 1er challenge trouvé va être retourné.`);
    }
    const challengeDataObjects = await challengeDatasource.getBySkillId(skills[0].id, locale);

    return _toDomainCollection({ challengeDataObjects });
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError(
        `Aucun challenge trouvé pour la mission : ${missionId}, le niveau ${activityLevel} et le numéro ${challengeNumber}`,
      );
    }
    throw error;
  }
};

const getActivityChallengesFor1d = async function ({ missionId, activityLevel, locale }) {
  const missionNamePrefix = await _getMissionNamePrefix(missionId);
  if (missionNamePrefix.length === 0) {
    throw new NotFoundError(`Aucune mission trouvée pour l'identifiant : ${missionId}`);
  }
  const activityLevelTubeName = _getPix1dActivityLevelTubeName(missionNamePrefix, activityLevel);
  const [activityLevelTube] = await tubeDatasource.findByNames([activityLevelTubeName]);
  if (activityLevelTube === undefined) {
    throw new NotFoundError(`Aucune activité trouvée pour la mission : ${missionId} et le niveau ${activityLevel}`);
  }
  const skills = await skillDatasource.findByTubeIdFor1d(activityLevelTube.id);

  let allLevelChallenges;
  try {
    allLevelChallenges = await Promise.all(skills.map((skill) => challengeDatasource.getBySkillId(skill.id, locale)));
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError(
        `Aucun challenge trouvé pour la mission : ${missionId}, l'acquis : ${error.skillId} et le niveau : ${activityLevel}`,
      );
    }
    throw error;
  }
  return allLevelChallenges.map((challenges) => _toDomainCollection({ challengeDataObjects: challenges }));
};

async function _getMissionNamePrefix(missionId) {
  const [firstTube] = await tubeDatasource.findByThematicId(missionId);
  const activityName = firstTube === undefined ? '' : firstTube.name;
  return activityName.split('_')[0];
}

function _getPix1dActivityLevelTubeName(missionNamePrefix, activityLevel) {
  return `${missionNamePrefix}_${_getPix1dLevelName(activityLevel)}`;
}

function _getPix1dLevelName(activityLevel) {
  let levelName;
  switch (activityLevel) {
    case Activity.levels.TUTORIAL:
      levelName = 'di';
      break;
    case Activity.levels.TRAINING:
      levelName = 'en';
      break;
    case Activity.levels.VALIDATION:
      levelName = 'va';
      break;
    default:
      return 'de';
  }
  return levelName;
}

export { getChallengeFor1d, getActivityChallengesFor1d };

function _toDomainCollection({ challengeDataObjects }) {
  const challenges = challengeDataObjects.map((challengeDataObject) => {
    return _toDomain({ challengeDataObject });
  });

  return challenges;
}

function _toDomain({ challengeDataObject }) {
  const solution = solutionAdapter.fromDatasourceObject(challengeDataObject);

  const validator = Challenge.createValidatorForChallengeType({
    challengeType: challengeDataObject.type,
    solution,
  });

  return new Challenge({
    id: challengeDataObject.id,
    type: challengeDataObject.type,
    status: challengeDataObject.status,
    instruction: challengeDataObject.instruction,
    alternativeInstruction: challengeDataObject.alternativeInstruction,
    proposals: challengeDataObject.proposals,
    illustrationUrl: challengeDataObject.illustrationUrl,
    attachments: challengeDataObject.attachments,
    embedUrl: challengeDataObject.embedUrl,
    embedTitle: challengeDataObject.embedTitle,
    embedHeight: challengeDataObject.embedHeight,
    validator,
    competenceId: challengeDataObject.competenceId,
    illustrationAlt: challengeDataObject.illustrationAlt,
    format: challengeDataObject.format,
    locales: challengeDataObject.locales,
    autoReply: challengeDataObject.autoReply,
    responsive: challengeDataObject.responsive,
    shuffled: challengeDataObject.shuffled,
    alternativeVersion: challengeDataObject.alternativeVersion,
  });
}
